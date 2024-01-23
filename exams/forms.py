from django import forms
from .models import Exam


class ExamForm(forms.ModelForm):
    class Meta:
        model = Exam
        fields = ['label', 'duration',
                  'score_type',
                  'point_passing_score', 'percent_passing_score',
                  'incorrect_penalty', 'unanswered_penalty', 'shuffle_answer', 'manual_chosen'
                  ]



class ExamFormUpdate(forms.ModelForm):
    class Meta:
        model = Exam
        fields = ['label', 'duration', 'score_type',
                  'point_passing_score', 'percent_passing_score',
                  'incorrect_penalty', 'unanswered_penalty', 'shuffle_answer', 'manual_chosen'
                  ]