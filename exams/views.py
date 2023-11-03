from django.views.generic import CreateView, ListView, UpdateView, DeleteView
from .models import Exam
from course.models import Course
from .forms import ExamForm, ExamFormUpdate
import json
from django.http import JsonResponse
from decimal import Decimal


class ExamListView(ListView):
    model = Exam
    template_name = 'home/exams.html'
    context_object_name = 'exams'

    def get_queryset(self):
        # Get the 'id' parameter from the URL
        course_id = self.kwargs['id']
        print('salam')
        print(course_id)

        # Filter the exams by 'id' if it's provided in the URL parameter
        if course_id:
            return Exam.objects.filter(course__pk=course_id)

        # If 'id' is not provided in the URL, return all exams
        return Exam.objects.all()


    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        exams = self.get_queryset()

        exams_data = [{
            'id': exam.id,
            'label': exam.label,
            'score_type': exam.score_type,
            'unanswered_penalty': exam.unanswered_penalty,
            'shuffle_answer': exam.shuffle_answer,
            'incorrect_penalty': exam.incorrect_penalty,
            'percent_passing_score': exam.percent_passing_score,
            'point_passing_score': exam.point_passing_score,
            'duration': exam.duration,
            'deadline': exam.deadline
        } for exam in exams]

        exams_json = json.dumps(exams_data, cls=DecimalEncoder, indent=4, sort_keys=True, default=str)
        context['exams_json'] = exams_json

        return context


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)


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

    def form_valid(self, form):
        course=Course.objects.get(id=self.kwargs['id'])
        exam = form.save(commit=False)
        exam.course = course
        exam.save()


class ExamUpdateView(UpdateView):
    model = Exam
    form_class = ExamFormUpdate
    template_name = 'home/exams.html'
    success_url = '/success/'


class ExamDelete(DeleteView):
    model = Exam
    template_name = 'home/exams.html'
    success_url = '/success/'

    def form_valid(self, form):
        self.object = self.get_object()
        self.object.delete()

        return JsonResponse({},status=200)


class ActiveExam(UpdateView):
    model = Exam
    fields = ['id',]
    template_name = 'home/exams.html'
    success_url = '/success/'

    def form_valid(self, form):
        self.object = self.get_object()
        self.object.action=True
        self.object.save()

        return JsonResponse({}, status=200)


