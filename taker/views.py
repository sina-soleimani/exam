from django.forms import model_to_dict
from django.shortcuts import render
from django.views.generic import View, CreateView
from questions import models
from .models import ProfileAnswer
from .forms import ProfileAnswerForm, ProfileAnswerFormEmpty
from result.models import Result
from exams.models import Exam
import json
from django.contrib.auth.decorators import login_required


class LoginRequiredMixin:
    @classmethod
    def as_view(cls, **initkwargs):
        view = super().as_view(**initkwargs)
        return login_required(view)


class examSession(LoginRequiredMixin, View):
    def get(self, request, id):
        exam = Exam.objects.filter(id=id).select_related('course__question_bank').first()
        question_bank = exam.course.question_bank
        questions = []

        for question_group in question_bank.q_bank_q_groups.all():
            for q in question_group.question_group_questions.all():
                questions.append(q)
        q = []

        for question in questions:
            question_dict = model_to_dict(question, fields=['id', 'description', 'score', 'question_type'])
            question_dict['question_choices'] = []
            question_dict['question_items'] = []
            question_dict['question_tf_answer'] = []

            for choice in question.question_choices.all():
                choice_dict = model_to_dict(choice, fields=['id', 'is_true', 'choice_text'])
                question_dict['question_choices'].append(choice_dict)

            for match in question.question_matches.all():
                match_dict = model_to_dict(match, fields=['id', 'item_text', 'match_text'])
                question_dict['question_items'].append(match_dict)

            answer = question.question_prof_answers.first()
            if answer:
                question_dict['question_answers'] = {
                    'pf_answer_id': answer.id,
                    'is_true': answer.is_true,
                    'mc_id': answer.choice_id,
                }

            q.append(question_dict)

        json_data = json.dumps(q)

        result = Result.objects.get_or_create(exam_id=id, student_id=request.user.id)

        return render(request, 'taker.html', context={
            'questionGroupsData': json_data,
            'questions': questions,
            'result_id': result[0].id})


class AnswerQuestionView(LoginRequiredMixin, CreateView):
    model = ProfileAnswer
    template_name = 'home/taker.html'
    success_url = '/success/'

    def get_form_class(self):
        if self.request.POST.get('q_type') == 'MC':
            return ProfileAnswerFormEmpty
        else:
            return ProfileAnswerForm

    def form_valid(self, form):
        if self.request.POST.get('pf_answer_id') is not None and self.request.POST.get('pf_answer_id') != '':
            profile_answer = ProfileAnswer.objects.get(id=self.request.POST.get('pf_answer_id'))
            if self.request.POST.get('q_type')=='MC':
                choice= models.Choice.objects.get(id=self.request.POST.get('mc_id'))
                profile_answer.choice=choice
            if self.request.POST.get('q_type')=='TF':
                profile_answer.is_true = self.request.POST.get('is_true')
            profile_answer.save()
        else:


            profile_answer = form.save(commit=False)
            question = models.Question.objects.get(id=self.request.POST.get('question_id'))
            profile_answer.question = question
            result = Result.objects.get(id=self.request.POST.get('result_id'))
            if self.request.POST.get('q_type')=='MC':
                choice= models.Choice.objects.get(id=self.request.POST.get('mc_id'))
                profile_answer.choice=choice

            profile_answer.result = result
            profile_answer.save()
        return super().form_valid(form)
