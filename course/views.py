from django.shortcuts import render
from .models import Course
from django.views.generic import CreateView, ListView, UpdateView, DeleteView
from .forms import CourseForm , CourseFormUpdate
from django.http import JsonResponse
import json
from decimal import Decimal
from questions.models import QuestionBank

# Create your views here.


class CourseListView(ListView):
    model = Course
    template_name = 'home/courses.html'
    context_object_name = 'courses'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        courses = self.get_queryset()
        courses_data = [{
            'id': course.id,
            'course_name': course.course_name,
            'course_code': course.course_code,
            'term': course.term,
            'year': course.year,
        } for course in courses]

        courses_json = json.dumps(courses_data, cls=DecimalEncoder, indent=4, sort_keys=True, default=str)
        print(courses_json)
        banks= QuestionBank.objects.all()
        banks_data = [{
            'id': bank.id,
            'name': bank.name,
        } for bank in banks]

        banks_json = json.dumps(banks_data, cls=DecimalEncoder, indent=4, sort_keys=True, default=str)
        context['courses_json'] = courses_json
        context['banks_json'] = banks_json

        return context


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)


class CourseCreateView(CreateView):
    model = Course
    form_class = CourseForm
    template_name = 'home/courses.html'
    success_url = '/success/'

    def form_invalid(self, form):
        errors = form.errors.as_json()
        return JsonResponse({'errors': errors}, status=400)

    def form_valid(self, form):
        print("Form is valid!")
        response = super().form_valid(form)

        return response


class CourseUpdateView(UpdateView):
    model = Course
    form_class = CourseFormUpdate
    template_name = 'home/courses.html'
    success_url = '/success/'

    def form_invalid(self, form):
        print("Form is INvalid!")
        errors = form.errors.as_json()
        print(errors)
        return JsonResponse({'errors': errors}, status=400)


def form_valid(self, form):
        print("Form is valid!")
        # Here you can add custom logic before saving the form
        # For example, you can perform some additional processing or validation

        # Call the parent class's form_valid method to save the form
        response = super().form_valid(form)

        # Add any additional custom logic after saving the form

        return response


class CourseDelete(DeleteView):
    model = Course
    template_name = 'home/courses.html'
    success_url = '/success/'

    def form_valid(self, form):
        self.object = self.get_object()
        self.object.delete()
        return JsonResponse({},status=200)

