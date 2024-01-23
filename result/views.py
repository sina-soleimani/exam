import json

from django.forms import model_to_dict
from django.shortcuts import redirect, render
from django.views import View

from .models import Result
from django.views.generic import ListView
from django.views.decorators.csrf import csrf_protect
from django.http import HttpRequest


# Create your views here.

class ResultListView(ListView):
    model = Result
    template_name = 'home/results.html'
    context_object_name = 'results'

    def get_queryset(self):
        # Get the 'id' parameter from the URL
        exam_id = self.kwargs['id']

        # Filter the exams by 'id' if it's provided in the URL parameter
        if exam_id:
            return Result.objects.filter(exam__pk=exam_id)

        # If 'id' is not provided in the URL, return all exam
        # TODO

        return Result.objects.all()


class ResultDetailListView(ListView):
    model = Result
    template_name = 'home/result-details.html'
    context_object_name = 'result'

    def get_queryset(self):
        # Get the 'id' parameter from the URL
        result_id = self.kwargs['id']

        # Filter the exams by 'id' if it's provided in the URL parameter
        result = Result.objects.get(id=result_id)
        print(result)

        # If 'id' is not provided in the URL, return all exam
        # TODO

        return result


class ResultDetailView(View):
    def get(self, request, id):
        result = Result.objects.get(id=id)
        exam = result.exam
        questions = list(exam.questions.all())
        user_id = result.student_id
        q = []

        for question in questions:
            question_dict = model_to_dict(question, fields=['id', 'description', 'score', 'question_type'])
            question_dict['question_choices'] = []
            question_dict['question_items'] = []
            question_dict['question_match'] = []
            question_dict['question_q_items'] = []
            question_dict['question_q_match'] = []
            question_dict['question_tf_answer'] = []

            for choice in question.question_choices.all():
                choice_dict = model_to_dict(choice, fields=['id', 'is_true', 'choice_text'])
                question_dict['question_choices'].append(choice_dict)

            answer = question.question_prof_answers.filter(student_id=user_id).first()
            if answer:
                for match in answer.match.all():
                    match_dict = model_to_dict(match, fields=['match_id', 'match_text'])
                    match_dict['id'] = match_dict.pop('match_id')
                    item_dict = model_to_dict(match, fields=['item_id', 'item_text'])

                    item_dict['id'] = item_dict.pop('item_id')
                    question_dict['question_items'].append(item_dict)
                    question_dict['question_match'].append(match_dict)

                for match in question.question_matches.all():
                    match_dict = model_to_dict(match, fields=['id', 'match_text'])
                    item_dict = model_to_dict(match, fields=['id', 'item_text'])
                    question_dict['question_q_items'].append(item_dict)
                    question_dict['question_q_match'].append(match_dict)

            if answer:
                question_dict['answer_choice'] = {
                    'mc_id': answer.choice_id,
                }
            if answer and question.question_answers.first():
                question_dict['question_answers'] = {
                    'pf_answer_id': answer.id,
                    'q_is_true': question.question_answers.first().is_true,
                    'is_true': answer.is_true,
                    'mc_id': answer.choice_id,
                }

            q.append(question_dict)

        json_data = json.dumps(q)

        return render(request, 'home/result-details.html', context={
            'questionGroupsData': json_data,
        })


# TODO
@csrf_protect
def calc_result(request: HttpRequest):
    exam_id = request.POST.get('exam_id')
    results = Result.objects.filter(exam__pk=exam_id).prefetch_related(
        'result_prof_answers__question__question_answers')

    for result in results:
        print(result)
        score = 0

        for result_prof_answer in result.result_prof_answers.all():

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

        result.score = score
        result.save()
    return redirect('results:resultList', id=exam_id)
