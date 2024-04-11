from datetime import datetime
from django.forms import model_to_dict
from django.http import Http404
from django.shortcuts import render
from django.views.generic import View, CreateView, UpdateView
from questions import models
from user.models import Profile
from .models import ProfileAnswer, ProfMatch
from .forms import ProfileAnswerForm, ProfileAnswerFormEmpty
from result.models import Result
from exams.models import Exam
import json
from django.contrib.auth.decorators import login_required
from decorator import access_level_required
from user.models import STUDENT_ACCESS, ADMIN_ACCESS


class LoginRequiredMixin:
    @classmethod
    def as_view(cls, **initkwargs):
        view = super().as_view(**initkwargs)
        return login_required(view)


class examSession(LoginRequiredMixin, View):
    @access_level_required(STUDENT_ACCESS)
    def get(self, request, id):
        exam = Exam.objects.get(id=id)
        if exam.exam_status != 'A':
            raise Http404("Exam status is not 'ACTIVE'")

        questions = list(exam.questions.all())
        user_id = self.request.user.id
        q = []

        for question in questions:
            question_dict = model_to_dict(question, fields=['id', 'description', 'score', 'question_type'])
            question_dict['question_choices'] = []
            question_dict['question_items'] = []
            question_dict['question_match'] = []
            question_dict['question_tf_answer'] = []

            for choice in question.question_choices.all():
                choice_dict = model_to_dict(choice, fields=['id', 'is_true', 'choice_text'])
                question_dict['question_choices'].append(choice_dict)
            question_dict['question_choices'] = sorted(
                question_dict['question_choices'],
                key=lambda x: hash((x['id'], user_id))
            )

            answer = question.question_prof_answers.filter(student_id=user_id, exam_id=exam.id).first()

            if answer:
                for match in answer.match.all():
                    match_dict = model_to_dict(match, fields=['match_id', 'match_text'])

                    match_dict['id'] = match_dict.pop('match_id')
                    item_dict = model_to_dict(match, fields=['item_id', 'item_text'])

                    item_dict['id'] = item_dict.pop('item_id')
                    question_dict['question_items'].append(item_dict)
                    question_dict['question_match'].append(match_dict)

            else:
                for match in question.question_matches.all():
                    match_dict = model_to_dict(match, fields=['id', 'match_text'])
                    item_dict = model_to_dict(match, fields=['id', 'item_text'])
                    question_dict['question_items'].append(item_dict)
                    question_dict['question_match'].append(match_dict)

                question_dict['question_items'] = sorted(
                    question_dict['question_items'],
                    key=lambda x: hash((x['item_text'], user_id))
                )
                question_dict['question_match'] = sorted(
                    question_dict['question_match'],
                    key=lambda x: hash((x['match_text'], user_id + 8))
                )

            if answer:
                question_dict['question_answers'] = {
                    'pf_answer_id': answer.id,
                    'is_true': answer.is_true,
                    'mc_id': answer.choice_id,
                }

            q.append(question_dict)
        q = sorted(
            q,
            key=lambda x: hash((x['id'], user_id + 8))
        )

        json_data = json.dumps(q)

        result = Result.objects.get_or_create(exam_id=id, student_id=request.user.id)
        current_time = datetime.now()
        time_difference = current_time - exam.active_time
        remain_time = exam.duration - time_difference
        s_remain_time = remain_time.total_seconds()
        if s_remain_time < 0:
            exam.exam_status = 'E'
            exam.save()

        return render(request, 'taker.html', context={
            'questionGroupsData': json_data,
            'questions': questions,
            'remain_time': s_remain_time,
            'result_id': result[0].id,
            'exam_id': exam.id,
        })


class AnswerQuestionView(LoginRequiredMixin, CreateView):
    model = ProfileAnswer
    template_name = 'home/taker.html'
    success_url = '/success/'
    form_class = None

    def get_form_class(self):
        if self.request.POST.get('q_type') == 'MC':
            return ProfileAnswerFormEmpty
        else:
            return ProfileAnswerForm

    @access_level_required(STUDENT_ACCESS)
    def form_valid(self, form):
        user_id = self.request.user.id
        match_ids = self.request.POST.getlist('match_ids[]')
        match_texts = self.request.POST.getlist('match_texts[]')
        item_ids = self.request.POST.getlist('item_ids[]')
        item_texts = self.request.POST.getlist('item_texts[]')
        exam_id = self.request.POST.get('exam_id')
        profile_answer = form.instance

        if self.request.POST.get('pf_answer_id') is not None and self.request.POST.get('pf_answer_id') != '':
            profile_answer = ProfileAnswer.objects.filter(exam_id=exam_id).get(id=self.request.POST.get('pf_answer_id'))

            if self.request.POST.get('q_type') == 'MC':
                choice = models.Choice.objects.get(id=self.request.POST.get('mc_id'))
                profile_answer.choice = choice
            elif self.request.POST.get('q_type') == 'MG':
                existing_matches = profile_answer.match.all()

                for match_id, item_id, item_text, match_text in zip(match_ids, item_ids, item_texts, match_texts):
                    existing_match = existing_matches.filter(match_id__iexact=match_id.strip()).first()

                    if existing_match:
                        existing_match.item_text = item_text
                        existing_match.item_id = item_id
                        existing_match.match_text = match_text
                        existing_match.save()

            elif self.request.POST.get('q_type') == 'TF':
                profile_answer.is_true = self.request.POST.get('is_true')

            profile_answer.save()
        else:
            profile_answer = form.save(commit=False)
            question = models.Question.objects.get(id=self.request.POST.get('question_id'))
            profile_answer.question = question
            result = Result.objects.get(id=self.request.POST.get('result_id'))

            if self.request.POST.get('q_type') == 'MC':
                choice = models.Choice.objects.get(id=self.request.POST.get('mc_id'))
                profile_answer.choice = choice
            elif self.request.POST.get('q_type') == 'MG':
                matches_objects = []

                for match_id, item_id, item_text, match_text in zip(match_ids, item_ids, item_texts, match_texts):
                    match = ProfMatch.objects.create(
                        match_text=match_text,
                        match_id=match_id,
                        item_text=item_text,
                        item_id=item_id
                    )

                    matches_objects.append(match)
                profile_answer.save()

                profile_answer.match.add(*matches_objects)

            profile_answer.result = result
            profile = Profile.objects.get(id=user_id)
            profile_answer.student = profile
            profile_answer.exam = Exam.objects.get(id=exam_id)
            profile_answer.save()

        return super().form_valid(form)
