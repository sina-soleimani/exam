from django.shortcuts import render
from django.views.generic import View
from questions import models
from django.views.generic import CreateView
from .models import ProfileAnswer
from .forms import ProfileAnswerForm
from result.models import Result
from exams.models import Exam
import json
from django.db.models import OuterRef, Subquery
from django.contrib.auth.decorators import login_required

class LoginRequiredMixin:
    @classmethod
    def as_view(cls, **initkwargs):
        view = super().as_view(**initkwargs)
        return login_required(view)

class examSession(LoginRequiredMixin,View):
    def get(self, request, id):
        exam = Exam.objects.filter(id=id).prefetch_related('exam_question_groups__question_group_questions').first()
        question_groups = exam.exam_question_groups.all()  # Access related QuestionGroups

        # question_qroups = models.QuestionGroup.objects.filter(exam__pk=id).prefetch_related('question_group_questions')
        # question_qroups = models.QuestionGroup.objects.all().prefetch_related('question_group_questions')
        subquery = Subquery(
            models.Answer.objects.filter(
                question=OuterRef('id')
            ).values('is_true')[:1]
        )
        # Annotate 'is_true' for each Question
        question_qroups = question_groups.annotate(
            question_group_questions__is_true=subquery
        )
        data = []
        for group in question_qroups:
            group_data = {
                'id': group.id,
                'name': group.name,
                'questions': [],
            }

            # Fetch the required fields from questions and answers
            # TODO IMAGE
            questions = group.question_group_questions.values(
                'id', 'description', 'score', 'question_type', 'image',
                'question_answer__is_true',  # Include the 'is_true' field from answers
            )

            for question in questions:
                # Add other answer-related fields here if needed
                group_data['questions'].append(question)

            data.append(group_data)

        json_data = json.dumps(data)

        result=Result.objects.get_or_create(exam_id=id, student_id=request.user.id)

        return render(request, 'taker.html', context={
            'questionGroupsData': json_data,
            'questions': question_qroups,
            'result_id':result[0].id})


class AnswerQuestionView(LoginRequiredMixin,CreateView):
    model = ProfileAnswer
    form_class = ProfileAnswerForm
    template_name = 'home/taker.html'
    success_url = '/success/'

    def form_valid(self, form):
        # Save the form and assign result if available
        profile_answer = form.save(commit=False)
        question=models.Question.objects.get(id=self.request.POST.get('question_id'))
        profile_answer.question = question
        result=Result.objects.get(id=self.request.POST.get('result_id'))
        profile_answer.result = result
        profile_answer.save()
        return super().form_valid(form)
