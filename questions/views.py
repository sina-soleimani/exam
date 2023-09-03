from django.forms.models import model_to_dict
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from .forms import QustionTrueFalseForm, QuestionGroupForm
from django.views.generic import CreateView, View
from .models import QuestionTrueFalse, QuestionGroup,Question

# Create your views here.

def index(request):
    return render(request, 'index.html')



def update_ordering(model, order):
    """ order is in the form [id,id,id,id] for example: [8,4,5,1,3] """
    original_order = model.objects.value_list('id', flat=True).order_by('order')
    order = filter( lambda x: x[1]!=x[2], zip(xrange(len(order)), order, original_order))
    for i in order:
        model.objects.filter(id=i[1]).update(order=i[0])

def question_truefalse_post(request):
    form = QustionTrueFalseForm(request.POST)
    if form.is_valid():
        form.save()
        form = QustionTrueFalseForm()


class MyForm(View):
    def get(self,request):
        question_qroups_form = QuestionGroupForm()
        question_true_false_form = QustionTrueFalseForm()

        question_qroups = QuestionGroup.objects.prefetch_related('question_group_questions').all()
        # for q in question_qroupss:

            # print(q.question_group_questions)

        form = QustionTrueFalseForm()
        print('get')
        return render(request, 'index.html', context={
        #
            'question_qroups': question_qroups,
            'question_true_false_form': question_true_false_form,
            'question_qroups_form': question_qroups_form})

    def post(self,request):
        print('salam123')
        question_qroups_form = QuestionGroupForm(request.POST)
        question_form = QustionTrueFalseForm(request.POST)
        print('2')
        print(question_form)

        if question_qroups_form.is_valid():

            new_question_group = question_qroups_form.save()
            print(type(new_question_group))
            return JsonResponse({'new_question_group': model_to_dict(new_question_group)}, status=200)

        elif question_form.is_valid():
            print('9090')
            new_question = question_form.save()
            print('dsf')

            return JsonResponse({'new_question': model_to_dict(new_question)}, status=200)

        else:
            print('redirect')
            return redirect('index.html')



class QuestionGroupDelete(View):
    def post(self, request, id):
        print("back of delete")
        qg= QuestionGroup.objects.get(id=id)
        qg.delete();
        return JsonResponse({'result':'ok'}, status=200)

class QuestionSort(View):
    def post(self, request, id):

        print(request.POST["question_id"])
        qg = QuestionGroup.objects.get(id=request.POST["question_group_id"])
        Question.objects.filter(id=request.POST["question_id"]).update(
            queston_group=qg
        )
        return JsonResponse({'result':'ok'}, status=200)

def dashboard(request):
    form = QuestionTrueFalse
    return render(request, "dwitter/dashboard.html", {"form": form})