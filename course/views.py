from django.shortcuts import render
from .models import Course
from django.views.generic import CreateView, ListView, UpdateView, DeleteView
from .forms import CourseForm, CourseFormUpdate
from django.http import JsonResponse
import openpyxl
import json
from decimal import Decimal
from questions.models import QuestionBank
from user.models import Profile

# Create your views here.

from decorator import access_level_required
from user.models import ADMIN_ACCESS
from django.db import transaction
from django.core import serializers



class CourseListView(ListView):
    model = Course
    template_name = 'home/courses.html'
    context_object_name = 'courses'

    @access_level_required(ADMIN_ACCESS)
    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        courses = self.get_queryset()
        courses_data = [{
            'id': course.id,
            'course_name': course.course_name,
            'course_code': course.course_code,
            'term': course.term,
            'year': course.year,
            'students': serializers.serialize('json', course.students.all()),
            'q_bank': None if not course.question_bank else course.question_bank.id,
        } for course in courses]

        courses_json = json.dumps(courses_data, cls=DecimalEncoder, indent=4, sort_keys=True, default=str)
        print(courses_json)
        banks = QuestionBank.objects.all()
        banks_data = [{
            'id': bank.id,
            'name': bank.name,
        } for bank in banks]

        banks_json = json.dumps(banks_data, cls=DecimalEncoder, indent=4, sort_keys=True, default=str)
        context['courses_json'] = courses_json
        context['banks_data'] = banks_data

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

    @access_level_required(ADMIN_ACCESS)
    def form_valid(self, form):
        print("Form is valid!")
        q_bank_id = self.request.POST.get('q_bank_id')
        q_bank_name = self.request.POST.get('q_bank_name')
        course = form.save(commit=False)
        if q_bank_id and type (q_bank_id) == 'number':
            q_bank = QuestionBank.objects.get(id=q_bank_id)
            course.question_bank = q_bank

        elif q_bank_name:
            with transaction.atomic():
                q_bank = QuestionBank.objects.create(name=q_bank_name)
            course.question_bank = q_bank
        course.teacher = self.request.user
        course.save()
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

    @access_level_required(ADMIN_ACCESS)
    def form_valid(self, form):
        print("Form is valid!")
        q_bank_id = self.request.POST.get('q_bank_id')
        q_bank_name = self.request.POST.get('q_bank_name')
        course = form.save(commit=False)
        if q_bank_name:
            with transaction.atomic():
                q_bank = QuestionBank.objects.create(name=q_bank_name)
            course.question_bank = q_bank

        elif q_bank_id and type (q_bank_id) == 'number':
            q_bank = QuestionBank.objects.get(id=q_bank_id)
            course.question_bank = q_bank

        course.save()

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

    @access_level_required(ADMIN_ACCESS)
    def form_valid(self, form):
        self.object = self.get_object()
        self.object.delete()
        return JsonResponse({}, status=200)


@access_level_required(ADMIN_ACCESS)
def upload_excel(request):
    course_id = request.POST['course_id']
    if request.method == 'POST' and request.FILES['excelFile']:
        excel_file = request.FILES['excelFile']

        try:
            workbook = openpyxl.load_workbook(excel_file, data_only=True)
            sheet = workbook.active  # Assuming the first sheet in the Excel file

            # Extract data from the first column (column A)
            column_data = [cell.value for cell in sheet['A']]
            profiles = Profile.objects.filter(username__in=column_data)
            course = Course.objects.get(id=course_id)

            course.students.clear()

            course.students.set(profiles)

            return JsonResponse({'message': 'File uploaded successfully', 'column_data': column_data})
        except Exception as e:
            return JsonResponse({'message': f'Error reading Excel file: {str(e)}'})

    return JsonResponse({'message': 'Please select a file to upload.'})
