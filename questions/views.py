from django.http import JsonResponse
from django.shortcuts import render, redirect
from .forms import QuestionGroupForm, TrueFalseModelForm
from exams.models import Exam
from django.views.generic import View
from .models import QuestionTrueFalse, QuestionGroup, Question, Answer

import json
from django.db.models import OuterRef, Subquery
from django.shortcuts import get_object_or_404

from django.views.generic.edit import FormView
from django.urls import reverse_lazy


# Create your views here.

def index(request):
    return render(request, 'builder.html')


class MyForm(View):
    template_name = 'builder.html'

    def get(self, request, id):
        print('GET request')
        question_qroups_form = QuestionGroupForm()

        question_qroups = QuestionGroup.objects.filter(exam__pk=id).prefetch_related('question_group_questions')

        # Subquery to fetch 'is_true' for each question
        subquery = Subquery(
            Answer.objects.filter(
                question=OuterRef('id')
            ).values('is_true')[:1]
        )

        # Annotate 'is_true' for each Question
        question_qroups = question_qroups.annotate(
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
            questions = group.question_group_questions.values(
                'id', 'description', 'score', 'question_type',
                'question_answer__is_true',  # Include the 'is_true' field from answers
            )

            for question in questions:
                # Add other answer-related fields here if needed
                group_data['questions'].append(question)

            data.append(group_data)

        json_data = json.dumps(data)
        return render(request, self.template_name, context={
            'question_qroups': question_qroups,
            'question_qroups_form': question_qroups_form,
            'questionGroupsData': json_data,
        })

    def post(self, request, id):
        question_qroups_form = QuestionGroupForm(request.POST)

        if question_qroups_form.is_valid():
            print('POST request')

            new_question_group = question_qroups_form.save(commit=False)
            new_question_group.exam = Exam.objects.get(pk=id)
            new_question_group.save()

            return JsonResponse({
                'new_question_group': new_question_group.id,
                'new_question_group_name': new_question_group.name
            }, status=200)

        return redirect('base.html')



#project Will be go in this api

class QBank(View):
    template_name = 'builder.html'

    def get(self, request):
        print('GET request')
        question_qroups_form = QuestionGroupForm()

        question_qroups = QuestionGroup.objects.all().prefetch_related('question_group_questions')

        # Subquery to fetch 'is_true' for each question
        subquery = Subquery(
            Answer.objects.filter(
                question=OuterRef('id')
            ).values('is_true')[:1]
        )

        # Annotate 'is_true' for each Question
        question_qroups = question_qroups.annotate(
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
            questions = group.question_group_questions.values(
                'id', 'description', 'score', 'question_type',
                'question_answer__is_true',  # Include the 'is_true' field from answers
            )

            for question in questions:
                # Add other answer-related fields here if needed
                group_data['questions'].append(question)

            data.append(group_data)

        json_data = json.dumps(data)
        return render(request, self.template_name, context={
            'question_qroups': question_qroups,
            'question_qroups_form': question_qroups_form,
            'questionGroupsData': json_data,
        })

    def post(self, request, id):
        question_qroups_form = QuestionGroupForm(request.POST)

        if question_qroups_form.is_valid():
            print('POST request')

            new_question_group = question_qroups_form.save(commit=False)
            new_question_group.exam = Exam.objects.get(pk=id)
            new_question_group.save()

            return JsonResponse({
                'new_question_group': new_question_group.id,
                'new_question_group_name': new_question_group.name
            }, status=200)

        return redirect('base.html')



class QuestionGroupDelete(View):
    def delete(self, request, id):
        try:
            data = json.loads(request.body.decode('utf-8'))
            name = data.get('name')

            if name == 'question':
                question = get_object_or_404(Question, id=id)
                question.delete()
            elif name == 'question_group':
                question_group = get_object_or_404(QuestionGroup, id=id)
                question_group.delete()
            else:
                return JsonResponse({'error': 'Invalid name'}, status=400)

            return JsonResponse({'result': 'ok'}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)


# TODO
class QuestionSort(View):
    def post(self, request, id):
        print(request.POST["question_id"])
        qg = QuestionGroup.objects.get(id=request.POST["question_group_id"])
        Question.objects.filter(id=request.POST["question_id"]).update(
            queston_group=qg
        )
        return JsonResponse({'result': 'ok'}, status=200)


# TODO
class CreateUpdateTrueFalseQuestionView(FormView):
    template_name = 'builder.html'
    form_class = TrueFalseModelForm
    success_url = reverse_lazy('question:true_false_question')
    http_method_names = ['post']  # Only allow POST requests

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        question_id = self.kwargs.get('question_id')  # Assuming you pass question_id in URL
        if question_id:
            question = get_object_or_404(Question, id=question_id)
            kwargs['instance'] = question
        return kwargs

    # will be use for test
    #
    # def post(self, request, *args, **kwargs):
    #     form = self.get_form()
    #     if form.is_valid():
    #         return self.form_valid(form)
    #     else:
    #         print('Form is not valid. Errors:', form.errors)
    #         return self.form_invalid(form)

    def form_valid(self, form):

        question_group_id = self.request.POST.get('question_group__id')
        try:
            question_group = QuestionGroup.objects.get(id=question_group_id)
        except QuestionGroup.DoesNotExist:
            form.add_error('question_group', 'Selected QuestionGroup does not exist')
            return self.form_invalid(form)

        form.instance.question_group = question_group

        question = form.save()
        answer=Answer.objects.update_or_create(
            question=question,
            defaults={'is_true': form.cleaned_data['is_true']},
        )
        response_data = {'question_id': question.id}
        return JsonResponse(response_data)