from django import forms
from .models import Course


class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ['course_name', 'course_code', 'term',
                  'year',]


class CourseFormUpdate(forms.ModelForm):
    class Meta:
        model = Course
        fields = ['course_name', 'course_code', 'term',
                  'year',]