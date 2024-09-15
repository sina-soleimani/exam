from datetime import datetime, timedelta

import pytz
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
import jdatetime
from django.db import transaction


class LoginRequiredMixin:
    @classmethod
    def as_view(cls, **initkwargs):
        view = super().as_view(**initkwargs)
        return login_required(view)


class examSession(LoginRequiredMixin, View):
    @access_level_required(STUDENT_ACCESS)
    def get(self, request, id):
        exam = Exam.objects.get(id=id)
        x = jdatetime.date.fromgregorian(date=datetime.now())
        iran_tz = pytz.timezone('Asia/Tehran')

        # Get the current time in Iran
        current_time = datetime.now(iran_tz)

        # Format the time as a string
        current_time_str = current_time.strftime('%H:%M:%S')

        print("Current time in Iran:", current_time_str)

        y = x.strftime('%m/%d/%Y')
        print(y[4:])
        print(y[:5])
        z = y[4:] + '/' + y[:5]
        print(z)
        print(type(exam.exam_time))
        print(type(exam.exam_time.strftime('%H:%M:%S')))
        print(type(exam.duration))
        print(type(str(exam.duration)))

        print((datetime.combine(datetime.date(current_time), exam.exam_time) + exam.duration).time())
        current_date = datetime.now().date()

        # Convert time objects to datetime objects with the same date
        # datetime1 = datetime.combine(current_date, time1)
        datetime2 = datetime.combine(current_date, exam.exam_time)
        timezone = pytz.timezone('Asia/Tehran')
        datetime2 = timezone.localize(datetime2)
        print('current_time < exam.exam_time + exam.duration')
        # print(current_time < exam.exam_time + exam.duration)
        if exam.exam_date == z[2:] and current_time_str > exam.exam_time.strftime(
                '%H:%M:%S') and exam.duration > current_time - datetime2:
            sina = 2
        else:

            # print('yyyyyyyyyyyyy')
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
        # current_time = datetime.now()
        time_difference = current_time - datetime2
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
            'result_score': result[0].score,
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
                with transaction.atomic():
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


class ExamDoneView(LoginRequiredMixin, CreateView):
    model = ProfileAnswer
    template_name = 'home/taker.html'
    success_url = '/success/'
    form_class = None

    def get_form_class(self):

        return ProfileAnswerForm

    @access_level_required(STUDENT_ACCESS)
    def form_valid(self, form):
        user_id = self.request.user.id
        exam_id = self.request.POST.get('exam_id')
        result = Result.objects.get(id=self.request.POST.get('result_id'))
        exam_sum_score = 0
        result_number = 0
        profile_answer = form.instance

        score = 0

        for result_prof_answer in result.result_prof_answers.all():
            # print(result_prof_answer.question.question_type)

            for question_choice in result_prof_answer.question.question_choices.filter(is_true=True):
                if question_choice.id == result_prof_answer.choice.id:
                    score += result_prof_answer.question.score
            all_match = 0
            correct_match = 0

            for question_match in result_prof_answer.match.all():
                all_match = all_match + 1
                if question_match.item_id == question_match.match_id:
                    correct_match = correct_match + 1

            if all_match != 0:
                score += int((correct_match / all_match) * result_prof_answer.question.score)

            for question_answer in result_prof_answer.question.question_answers.all():
                print(f"Answer avl: {question_answer.is_true}")

                if question_answer.is_true == result_prof_answer.is_true:
                    score += result_prof_answer.question.score
        if score != 0:
            exam_sum_score = exam_sum_score + score
            result_number = result_number + 1

        result.score = score
        result.save()

        profile_answer.result = result
        profile = Profile.objects.get(id=user_id)
        profile_answer.student = profile
        profile_answer.exam = Exam.objects.get(id=exam_id)
        profile_answer.save()

        return super().form_valid(form)
