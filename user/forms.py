from django import forms
from .models import Profile, ADMIN_ACCESS, STUDENT_ACCESS, TEACHER_ACCESS, ACCESS_LEVEL_CHOICES, HEAD_ADMIN_ACCESS
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django_recaptcha.fields import ReCaptchaField
from captcha.fields import CaptchaField
from django.contrib.auth.hashers import make_password
from simplemathcaptcha.fields import MathCaptchaField
from simplemathcaptcha.widgets import MathCaptchaWidget


class ProfileCreationForm(UserCreationForm):
    class Meta:
        model = Profile
        fields = ('username', 'email', 'password1', 'password2')


class ProfileLoginForm(forms.Form):
    username = forms.CharField(label="نام کاربری", max_length=100,
                               widget=forms.TextInput(attrs={'placeholder': 'نام کاربری'}))
    password = forms.CharField(label="رمز عبور", widget=forms.PasswordInput(attrs={'placeholder': 'رمز عبور'}))

    captcha = MathCaptchaField(
        widget=MathCaptchaWidget(
            question_tmpl="%(num2)i  %(operator)s %(num1)i")
    )


class AddProfileForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)

        super(AddProfileForm, self).__init__(*args, **kwargs)
        if user and user.access_level == ADMIN_ACCESS:
            self.fields['access_level'].choices = [(TEACHER_ACCESS, 'Teacher'), (STUDENT_ACCESS, 'Student')]
        elif user and user.access_level == TEACHER_ACCESS:
            self.fields['access_level'].choices = [(STUDENT_ACCESS, 'Student')]
        elif user and user.access_level == HEAD_ADMIN_ACCESS:
            self.fields['access_level'].choices = [(ADMIN_ACCESS, 'Admin'), (TEACHER_ACCESS, 'Teacher'),
                                                   (STUDENT_ACCESS, 'Student')]

    class Meta:
        model = Profile
        fields = ['entry_year', 'major_code', 'username', 'password', 'access_level']

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.password = make_password(self.cleaned_data['password'])
        if commit:
            instance.save()
        return instance
