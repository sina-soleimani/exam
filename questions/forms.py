from django import forms
from .models import QuestionTrueFalse, QuestionGroup, Question
# TODO file need to consider

class TrueFalseModelForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['description', 'image', 'audio', 'score', 'question_group', 'question_type']

    question_type = forms.CharField(required=False)
    is_true = forms.BooleanField(
        required=True,
        initial=True,  # You can set the default value as needed
        label="True or False"
    )

    def __init__(self, *args, **kwargs):
        super(TrueFalseModelForm, self).__init__(*args, **kwargs)
        self.fields['question_type'].initial = Question.QuestionType.TRUE_FALSE
        self.fields['question_type'].widget = forms.HiddenInput()


class MultipleChoiceModelForm(forms.ModelForm):
    pass


class MatchingChoiceModelForm(forms.ModelForm):
    pass


class GeneralQuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['question_type', 'description', 'audio', 'image', 'score', ]

# TODO have to delete
class QustionTrueFalseForm(forms.ModelForm):
    class Meta:
        model = QuestionTrueFalse
        fields = ['description', 'audio', 'image', 'score', 'true_false']

        widgets = {
            'description': forms.Textarea(attrs={'class': 'form-control'}),
            'image': forms.FileInput(attrs={'class': 'form-control'}),
            'audio': forms.FileInput(attrs={'class': 'form-control question-audio'}),
            # 'audio': forms.FileInput(attrs={'class':'form-control form-label'}),
            'score': forms.NumberInput(attrs={'class': 'form-control'}),
            'true_false': forms.CheckboxInput(attrs={'class': 'form-control'})
        }


class QuestionGroupForm(forms.ModelForm):
    class Meta:
        model = QuestionGroup
        fields = ['name']

        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
        }

    # exam = forms.ModelMultipleChoiceField(
    #     queryset=Exam.objects.all(),
    #     widget=forms.CheckboxSelectMultiple
    # )
