from django.shortcuts import render
from django.views.generic import CreateView, ListView
from .models import Exam
from .forms import ExamForm


# Create your views here.

class ExamListView(ListView):
    model = Exam
    template_name = 'home/exams.html'
    context_object_name = 'exams'


class StudentExamListView(ListView):
    model = Exam
    template_name = 'home/student-exams.html'
    context_object_name = 'exams'

    def get_queryset(self):
        # Return only exams where action is True
        print('salam')
        return Exam.objects.filter(action=True)




class ExamCreateView(CreateView):
    model = Exam
    form_class = ExamForm
    template_name = 'home/exams.html'
    success_url = '/success/'