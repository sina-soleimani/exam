from django.http import JsonResponse
from django.shortcuts import render, redirect
from .forms import QuestionGroupForm, TrueFalseModelForm, QuestionForm
from exams.models import Exam
from django.views.generic import View
from .models import QuestionTrueFalse, QuestionGroup, Question, Answer, Choice, QuestionBank
from django.forms.models import model_to_dict

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

    def get(self, request, id):
        question_qroups_form = QuestionGroupForm()
        question_qroups = QuestionGroup.objects.filter(q_bank=id).select_related('q_bank')

        data = []
        for group in question_qroups:
            group_data = {
                'id': group.id,
                'name': group.name,
                'questions': [],
            }

            questions = group.question_group_questions.prefetch_related('question_choices', 'question_answers')

            for question in questions:
                question_dict = model_to_dict(question, fields=['id', 'description', 'score', 'question_type'])
                question_dict['question_choices'] = []

                for choice in question.question_choices.all():
                    choice_dict = model_to_dict(choice, fields=['id','is_true', 'choice_text'])
                    question_dict['question_choices'].append(choice_dict)

                answer = question.question_answers.first()
                if answer:
                    question_dict['question_answers'] = {
                        'is_true': answer.is_true,
                        # Include other fields from the Answer model if needed
                    }

                group_data['questions'].append(question_dict)

            data.append(group_data)

        json_data = json.dumps(data)
        return render(request, self.template_name, context={
            'question_qroups': question_qroups,
            'question_qroups_form': question_qroups_form,
            'questionGroupsData': json_data,
        })

    def post(self, request,id):
        question_qroups_form = QuestionGroupForm(request.POST)

        if question_qroups_form.is_valid():
            print('POST request')

            new_question_group = question_qroups_form.save(commit=False)
            new_question_group.q_bank = QuestionBank.objects.get(id=id)
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
            question_group=qg
        )
        return JsonResponse({'result': 'ok'}, status=200)


# TODO
class CreateUpdateMultiQuestionView(FormView):
    template_name = 'builder.html'
    success_url = '/success/'
    http_method_names = ['post']

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        question_id = self.kwargs.get('question_id')  # Assuming you pass question_id in URL
        if question_id:
            question = get_object_or_404(Question, id=question_id)
            kwargs['instance'] = question
        return kwargs

    def get_form(self, form_class=None):
        return QuestionForm(**self.get_form_kwargs())

    def form_valid(self, form):
        question_group_id = self.request.POST.get('question_group__id')

        try:
            question_group = QuestionGroup.objects.get(id=question_group_id)
        except QuestionGroup.DoesNotExist:
            form.add_error('question_group', 'Selected QuestionGroup does not exist')
            return self.form_invalid(form)

        form.instance.question_group = question_group

        # Save the question form
        question = form.save()
        last_choices = Choice.objects.filter(question=question).values('id')
        choice_texts_json = self.request.POST.get('choice_text')  # Assuming 'choice_text' is the key in your form data
        choice_texts = json.loads(choice_texts_json)
        choice_array=[]

        for choice_text in choice_texts:
            print(choice_text)
            if choice_text['value'] == self.request.POST.get('selected_choice_text'):

                choice_text_id = choice_text.get('id')

                # Check if a Choice with the given choice_text_id exists
                existing_choice = Choice.objects.filter(id=choice_text_id).first()

                if existing_choice:
                    choice_array.append(choice_text_id)

                    # Update the existing Choice
                    existing_choice.question = question
                    existing_choice.choice_text = choice_text['value']
                    existing_choice.is_true = True
                    existing_choice.save()
                else:
                    # Create a new Choice since it doesn't exist
                    new_choice = Choice.objects.create(
                        id=choice_text_id,
                        question=question,
                        choice_text=choice_text['value'],
                        is_true=True
                    )
                    choice_array.append(new_choice.id)


            else:
                choice_text_id = choice_text.get('id')

                # Check if a Choice with the given choice_text_id exists
                existing_choice = Choice.objects.filter(id=choice_text_id).first()

                if existing_choice:
                    choice_array.append(choice_text_id)

                    # Update the existing Choice
                    existing_choice.question = question
                    existing_choice.choice_text = choice_text['value']
                    existing_choice.is_true = False
                    existing_choice.save()
                else:
                    # Create a new Choice since it doesn't exist
                    new_choice = Choice.objects.create(
                        id=choice_text_id,
                        question=question,
                        choice_text=choice_text['value'],
                        is_true=False
                    )

                    choice_array.append(new_choice.id)

        # Assuming Choice model has an 'id' field

        last_ids = [item['id'] for item in last_choices]
        choice_ids = choice_array

        # Find the elements in last_ids that are not in choice_ids
        unchosen_ids = [id for id in last_ids if id not in choice_ids]

        choice_ids_to_delete = [choice for choice in unchosen_ids]

        # Delete choices with the specified IDs
        Choice.objects.filter(id__in=choice_ids_to_delete).delete()

        return super().form_valid(form)

    def form_invalid(self, form):
        errors = form.errors.as_json()
        return JsonResponse({'errors': errors}, status=400)


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