from django.shortcuts import render
from django.views.generic import CreateView, View
from .models import Exam


# Create your views here.

class ExamList(View):

    def get(self,request):
        print('321')
        exams = Exam.objects.all()
        print('123')

        return render(request, 'home/exams.html', context={
            'exams': exams})

class ExamSubmit(View):
    def post(self, request):
        print('aliiireza')
        posted_exam=request.POST
        print(request.POST)
        exam=Exam()
        print(request.POST.get('examDate'))
        # print(posted_exam['examDate'])
        exam.label=posted_exam['examLabel']
        exam.deadline=posted_exam.get('examDate',None)
        exam.start=posted_exam.get('timePicker',None)
        exam.end=posted_exam.get('endExam',None)
        exam.save()

        exams = Exam.objects.all()
        print('123')

        return render(request, 'home/exams.html', context={
            'exams': exams})


