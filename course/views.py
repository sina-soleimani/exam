from django.shortcuts import render
from .models import Course
from django.views.generic import CreateView, ListView, UpdateView, DeleteView
import json

# Create your views here.


class CourseListView(ListView):
    model = Course
    template_name = 'home/courses.html'
    context_object_name = 'courses'

    # def get_context_data(self, **kwargs):
    #     context = super().get_context_data(**kwargs)
    #     courses = self.get_queryset()
    #     print('salam')
    #     # print(course.question_bank.all())
    #
    #     courses_data = [{
    #         'id': course.id,
    #         # 'course_name': type(course.course_name),
    #         # 'course_code': course.course_code,
    #         # 'term': course.term,
    #         # 'year': course.year,
    #         'qqq': course.question_bank.id,
    #     } for course in courses]
    #
    #     courses_json = json.dumps(courses_data, cls=DecimalEncoder, indent=4, sort_keys=True, default=str)
    #     print(courses_json)
    #
    #     context['courses_json'] = courses_json
    #
    #     return context


# class DecimalEncoder(json.JSONEncoder):
#     def default(self, obj):
#         if isinstance(obj, Decimal):
#             return str(obj)
#         return super(DecimalEncoder, self).default(obj)
