from django.shortcuts import redirect
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


# TODO
@csrf_protect
def calc_result(request: HttpRequest):
    exam_id = request.POST.get('exam_id')
    results = Result.objects.filter(exam__pk=exam_id).prefetch_related(
        'result_prof_answers__question__question_answers')

    for result in results:
        score = 0
        # print(f"Result ID: {result.id}")
        # Access other attributes of the Result model as needed

        for result_prof_answer in result.result_prof_answers.all():
            # print(f"prof answer: {result_prof_answer.is_true}")
            # print(f"Question ID: {result_prof_answer.question.id}")
            # print(f"Question SCORE: {result_prof_answer.question.score}")
            # Access other attributes of the ResultProfAnswer model as needed

            for question_answer in result_prof_answer.question.question_answers.all():
                # print(f"Answer avl: {question_answer.is_true}")

                if question_answer.is_true == result_prof_answer.is_true:
                    score += result_prof_answer.question.score
                    print(f"SCORE SUM: {score}")
                print(f"Answer ID: {question_answer.id}")

        result.score = score
        result.save()
        # Access other attributes of the Questi
    return redirect('results:resultList', id=exam_id)
