from django.views.generic import ListView, View
from django.shortcuts import render, redirect

from result.models import Result
from user.models import Profile,STUDENT_ACCESS
from decorator import access_level_required
from user.models import ADMIN_ACCESS
import json
from decimal import Decimal
from django.db.models import Prefetch
from course.models import Course
from exams.models import Exam
from django.urls import reverse



class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)


class ReportListView(ListView):
    model = Profile
    template_name = 'home/reports.html'
    context_object_name = 'profiles'

    @access_level_required(ADMIN_ACCESS)
    def get_queryset(self):
        profiles = Profile.objects.filter(student_course__isnull=False).distinct()
        print(profiles)
        print('2134434')


        username = self.request.GET.get('username')
        teacher_id = self.request.GET.get('teacherId')
        exam_id = self.request.GET.get('examId')
        course_id = self.request.GET.get('courseId')
        entry_year_id = self.request.GET.get('entryYearId')
        empty_profiles = Profile.objects.none()
        print(exam_id)
        print('exam_id')
        # Apply additional filters based on the search values
        if username:
            uprofiles = profiles.filter(username=username)
            profiles=uprofiles
        if teacher_id:
            profiles = profiles.filter(pk=teacher_id)
        if exam_id:
            exam = Exam.objects.get(label=exam_id)
            course = Course.objects.get(course_exams=exam)
            profiles = profiles.filter(student_course__id=course.pk)
            # empty_profiles = empty_profiles.union(eprofiles)

        if course_id and course_id != 'None'and course_id != '0':
            course = Course.objects.get(course_name=course_id)
            profiles = profiles.filter(student_course=course)
        if entry_year_id:
            profiles = profiles.filter(entry_year=entry_year_id)
        print('213e2442342')
        print(profiles)


        # Prefetch related courses, exams, and results
        # profiles = empty_profiles.prefetch_related(
        #     Prefetch('student_courses__course_exams__exam_results', queryset=Result.objects.all(),
        #              to_attr='profile_results')
        # )
        profiles = profiles.prefetch_related(
            Prefetch('student_courses__course_exams__exam_results', queryset=Result.objects.all(),
                     to_attr='profile_results')
        )
        print(profiles)
        # print(f"Profiles after prefetch: {profiles}")
        print('PREprofiles')
        print(profiles)
        print('postprofiles')

        return profiles

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        profiles = context['profiles']
        courses=Course.objects.all()
        exams= Exam.objects.values_list('label', flat=True).distinct()

        teachers = Profile.objects.exclude(access_level=STUDENT_ACCESS)
        unique_entry_years = Profile.objects.values_list('entry_year', flat=True).distinct()


        results_data = []
        for profile in profiles:
            profile_results = list(profile.student_results.all())
            for result in profile_results:
                setattr(result, 'username', profile.username)
                setattr(result, 'entry_year', profile.entry_year)
                setattr(result, 'course_name', result.exam.course.course_name)
                setattr(result, 'exam_label', result.exam.label)
                setattr(result, 'teacher', result.exam.course.teacher.username)
                setattr(result, 'pass_score', result.exam.point_passing_score)
                setattr(result, 'max_score', result.exam.score)
                setattr(result, 'avg_score', result.exam.avg_score)
                setattr(result, 'term', result.exam.course.term)
                results_data.append(result)


        # res_json = json.dumps(results_data, cls=DecimalEncoder, indent=4, sort_keys=True, default=dict)
        print('results_data')
        print(results_data)


        context['courses'] = list(courses)
        context['exams'] = list(exams)
        context['teachers'] = list(teachers)

        context['results_data'] = results_data
        context['entry_years'] = list(unique_entry_years)

        return context


from django.http import JsonResponse
from django.http import JsonResponse
from django.views import View


class ReportFilterView(View):
    def get(self, request, *args, **kwargs):
        # Retrieve request parameters
        username = request.GET.get('username')
        teacher_id = request.GET.get('teacherId')
        exam_id = request.GET.get('examId')
        course_id = request.GET.get('courseId')
        entry_year_id = request.GET.get('entryYearId')
        results=Result.objects.all()

        # Apply filters and retrieve filtered data
        profiles = Profile.objects.all()


        if username:
            results=results.filter(student__username__contains=username)
            profiles = profiles.filter(username=username)
        # if teacher_id:
        #     profiles = profiles.filter(pk=teacher_id)
        if exam_id:
            results=results.filter(exam__label=exam_id)

        if course_id and course_id != 'None' and course_id != '0':
            results=results.filter(exam__course__course_name=course_id)
            course = Course.objects.get(course_name=course_id)
            profiles = profiles.filter(student_course=course)

        if entry_year_id:
            results=results.filter(student__entry_year=entry_year_id)

            profiles = profiles.filter(entry_year=entry_year_id)

        if teacher_id:
            results=results.filter(exam__course__teacher__pk=teacher_id)

            profiles = profiles.filter(entry_year=entry_year_id)

        # Prefetch related courses, exams, and results
        # profiles = profiles.prefetch_related(
        #     Prefetch('student_courses__course_exams__exam_results', queryset=Result.objects.all(),
        #              to_attr='profile_results')
        # )

        # Prepare the response data
        results_data = []
        profile_results = []
        profile_results=list(results)


        for result in set(profile_results):
            result_data = {
                    'username': result.student.username,
                    'entry_year': result.student.entry_year,
                    'course_name': result.exam.course.course_name,
                    'exam_label': result.exam.label,
                    'teacher': result.exam.course.teacher.username,
                    'pass_score': result.exam.point_passing_score,
                    'max_score': result.exam.score,
                    'avg_score': result.exam.avg_score,
                    'score': result.score,
                    'term': result.exam.course.term,
            }
            results_data.append(result_data)

        response_data = {
            'results_data': results_data,
            # Add any other relevant data you want to send back to the frontend
        }

        return JsonResponse(response_data)

