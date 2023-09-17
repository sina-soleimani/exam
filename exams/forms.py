from django import forms
from .models import Exam


class ExamForm(forms.ModelForm):
    class Meta:
        model = Exam
        fields = ['label', 'deadline', 'duration']
