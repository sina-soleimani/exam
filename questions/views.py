from django.http import JsonResponse
from django.shortcuts import render, redirect
from .forms import QustionTrueFalseForm, QuestionGroupForm, TrueFalseModelForm
from exams.models import Exam
from django.views.generic import CreateView, View
from .models import QuestionTrueFalse, QuestionGroup, Question, Answer

import json
from django.shortcuts import get_object_or_404

# TODO check wich import is need
from django.views.decorators.csrf import csrf_exempt
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
        question_qroups = QuestionGroup.objects.filter(exam__pk=id).prefetch_related('question_group_questions').all()

        return render(request, self.template_name, context={
            'question_qroups': question_qroups,
            'question_qroups_form': question_qroups_form
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


# TODO
# @csrf_exempt
class CreateQuestion(View):
    def post(self, request):
        file = request.FILES.get("file")
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
        questiontf = QustionTrueFalseForm(description=new_question['description'])
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
            newQ.description = new_question['description']

            print('321')

            questiontf.save()
            print('321')
            return JsonResponse({'result': 'ok'}, status=200)

        # else:
        #     print('redirect')
        #     return redirect('base.html')


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


# TODO check this method is need
def trueFalseMaker(request):
    if request:
        return True
    else:
        return False


# TODO
class CreateUpdateTrueFalseQuestionView(FormView):
    template_name = 'builder.html'
    form_class = TrueFalseModelForm
    success_url = reverse_lazy('success_page')

    # @csrf_exempt
    def post(self, request, *args, **kwargs):
        print(request.POST)
        form = self.get_form()
        if form.is_valid():
            return self.form_valid(form)
        else:
            print(form.errors)
            return self.form_invalid(form)

    def form_valid(self, form):
        print('form valid')
        # Create the question with the question_type automatically set to 'TRUE_FALSE'
        question = form.save()
        print(question)
        # question = form.save(commit=False)
        # question.question_type = Question.QuestionType.TRUE_FALSE
        # question.save()

        # Create the answer
        Answer.objects.create(
            question=question,
            is_true=form.cleaned_data['is_true'],
        )

        return super().form_valid(form)
