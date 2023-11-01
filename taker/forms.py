from django import forms
from .models import ProfileAnswer


class ProfileAnswerForm(forms.ModelForm):
    class Meta:
        model = ProfileAnswer
        fields = ['is_true', ]


