from django import forms
from .models import QuestionTrueFalse, QuestionGroup

class QustionTrueFalseForm(forms.ModelForm):

    class Meta:

        model=QuestionTrueFalse
        fields= ['description','audio', 'image','barm','true_false']

        widgets = {
            'description': forms.Textarea(attrs={'class': 'form-control'}),
            'image': forms.FileInput(attrs={'class': 'form-control'}),
            'audio': forms.FileInput(attrs={'class':'form-control question-audio'}),
            # 'audio': forms.FileInput(attrs={'class':'form-control form-label'}),
            'barm': forms.NumberInput(attrs={'class': 'form-control'}),
            'true_false': forms.CheckboxInput(attrs={'class': 'form-control'})
        }


class QuestionGroupForm(forms.ModelForm):
    class Meta:
        model= QuestionGroup
        fields=['name']

        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'})
        }