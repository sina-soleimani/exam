from django import forms
from .models import QuestionTrueFalse, QuestionGroup, Question


class TrueFalseModelForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['description', 'image', 'audio', 'score', 'question_group', 'question_type']

    # TODO after add all question check this part of code
    score = forms.IntegerField(initial=0)
    question_type = forms.CharField(initial=Question.QuestionType.TRUE_FALSE, widget=forms.HiddenInput())

    is_true = forms.BooleanField(
        required=False,
        initial=True,
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


class QuestionGroupForm(forms.ModelForm):
    class Meta:
        model = QuestionGroup
        fields = ['name']

        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder':'Group Name'}),
        }
