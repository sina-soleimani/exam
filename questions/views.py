from django.core.files.storage import FileSystemStorage
from django.forms.models import model_to_dict
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from .forms import QustionTrueFalseForm, QuestionGroupForm
from exams.models import Exam
# from exams.forms import ExamForm
from django.core import serializers
from django.views.generic import CreateView, View
from .models import QuestionTrueFalse, QuestionGroup,Question
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt


# Create your views here.

def index(request):
    return render(request, 'builder.html')


class MyForm(View):
    def get(self,request, id):
        print('gettttttttttttt')
        question_qroups_form = QuestionGroupForm()
        question_true_false_form = QustionTrueFalseForm()

        question_qroups = QuestionGroup.objects.filter(exam__pk=id).prefetch_related('question_group_questions').all()


        return render(request, 'builder.html', context={
            'question_qroups': question_qroups,
            'question_true_false_form': question_true_false_form,
            'question_qroups_form': question_qroups_form})

    def post(self,request,id):
        print('iddddddddddddddd')
        print(request.POST)
        question_qroups_form = QuestionGroupForm(request.POST)
        # question_qroups_form.exam.add(Exam.objects.get(pk=id))
        question_form = QustionTrueFalseForm(request.POST)

        if question_qroups_form.is_valid():
            print('334')

            new_question_group = question_qroups_form.save()
            print(new_question_group)
            print(new_question_group.id)
            # exam=serializers.serialize('json', Exam.objects.get(pk=id))
            # print(ExamForm())
            print('sinasol')
            qg=QuestionGroup.objects.get(pk=new_question_group.id)
            #     # .update(exam=exam)
            qg.exam=(Exam.objects.get(pk=id))
            # qg('exam__pk'== id)
            qg.save()
            print(new_question_group)
            # new_question_group.exam = serializers.serialize('json', new_question_group.exam.all())
            # for item in qg['exam']:
            #     item = model_to_dict(item)
            # qg.exam=model_to_dict(qg.exam)
            # print(QuestionGroup.objects.filter(pk=new_question_group.id).first())
            return JsonResponse({'new_question_group': new_question_group.id, 'new_question_group_name': new_question_group.name }, status=200)

        elif question_form.is_valid():
            new_question = question_form.save()

            return JsonResponse({'new_question': model_to_dict(new_question)}, status=200)

        else:
            return redirect('base.html')

# TODO
# @csrf_exempt
class CreateQuestion(View):
    def post(self,request):
        file=request.FILES.get("file")
        print(request.POST['description'])
        print(request.POST['true_false'])
        # QuestionTrueFalse.objects.create()

        # print('salam')
        # print(file)
        # fss=FileSystemStorage()
        # filename=fss.save('file',file)
        # url=fss.url(filename)


        # response = validate_request(request)

        new_question = request.POST.dict()
        intial = {
            'description': new_question['description'],
            'true_false': trueFalseMaker(new_question['true_false']),
        }
        questiontf=QustionTrueFalseForm(description=new_question['description'])
        print('befor if')
        print(questiontf)
        # question_form = QustionTrueFalseForm(request.POST)



        if questiontf.is_valid():
            print('shodddddddddddddddd')
            true_false_maker = trueFalseMaker(new_question['true_false'])
            print(new_question['true_false'])

            newQ = QuestionTrueFalse(
                # description=new_question['description'],
                # image=new_question['image'],
                # audio=url,
                # true_false= true_false_maker
            )
            newQ.description=new_question['description']


            print('321')

            questiontf.save()
            print('321')
            return JsonResponse({'result':'ok'}, status=200)

        # else:
        #     print('redirect')
        #     return redirect('base.html')



class QuestionGroupDelete(View):
    def post(self, request, id):
        print(request.POST['name'])
        if request.POST['name']=='question':
            q = Question.objects.get(id=id)
            q.delete()
        elif request.POST['name']=='question_group':
            qg= QuestionGroup.objects.get(id=id)
            qg.delete()

        return JsonResponse({'result':'ok'}, status=200)

# TODO
class QuestionSort(View):
    def post(self, request, id):

        print(request.POST["question_id"])
        qg = QuestionGroup.objects.get(id=request.POST["question_group_id"])
        Question.objects.filter(id=request.POST["question_id"]).update(
            queston_group=qg
        )
        return JsonResponse({'result':'ok'}, status=200)



def trueFalseMaker(request):
    if request:
        return True
    else:
        return False
