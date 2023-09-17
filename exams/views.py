from django.shortcuts import render
from django.views.generic import CreateView, View
from .models import Exam
from .forms import ExamForm


# Create your views here.

class ExamList(View):
    template_name = 'home/exams.html'

    def get(self, request):
        exams = Exam.objects.all()
        return render(request, self.template_name, context={
            'exams': exams})


class ExamSubmit(View):
    template_name = 'home/exams.html'

    def post(self, request):
        # Create an instance of the ExamForm with POST data
        form = ExamForm(request.POST)

        if form.is_valid():
            form.save()

        exams = Exam.objects.all()

        return render(request, self.template_name, context={'exams': exams})

    def get(self, request):
        form = ExamForm()

        exams = Exam.objects.all()

        return render(request, self.template_name, context={'exams': exams, 'form': form})
