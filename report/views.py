from django.views.generic import ListView

from result.models import Result
from user.models import Profile
from decorator import access_level_required
from user.models import ADMIN_ACCESS
import json
from decimal import Decimal
from django.db.models import Prefetch

class ReportListView(ListView):
    model = Profile
    template_name = 'home/reports.html'
    context_object_name = 'profiles'

    @access_level_required(ADMIN_ACCESS)
    def get_queryset(self):
        profiles = Profile.objects.filter(student_course__isnull=False).distinct()

        # Prefetch related courses, exams, and results
        profiles = profiles.prefetch_related(
            Prefetch('student_courses__course_exams__exam_results', queryset=Result.objects.all(),
                     to_attr='profile_results')
        )
        print(f"Profiles after prefetch: {profiles}")

        return profiles

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        profiles = context['profiles']

        results_data = []
        for profile in profiles:
            profile_results = list(profile.student_results.all())
            for result in profile_results:
                setattr(result, 'username', profile.username)
                setattr(result, 'entry_year', profile.entry_year)
                setattr(result, 'course_name', result.exam.course.course_name)
                setattr(result, 'teacher', result.exam.course.teacher.username)
                setattr(result, 'pass_score', result.exam.point_passing_score)
                setattr(result, 'max_score', result.exam.score)
                setattr(result, 'avg_score', result.exam.avg_score)
                setattr(result, 'term', result.exam.course.term)
                results_data.append(result)

        context['results_data'] = results_data

        return context


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)
