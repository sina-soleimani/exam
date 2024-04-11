from django import forms
from .models import Profile, ADMIN_ACCESS,STUDENT_ACCESS, TEACHER_ACCESS, ACCESS_LEVEL_CHOICES
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django_recaptcha.fields import ReCaptchaField
from captcha.fields import CaptchaField
from django.contrib.auth.hashers import make_password



class ProfileCreationForm(UserCreationForm):
    class Meta:
        model = Profile
        fields = ('username', 'email', 'password1', 'password2')


class ProfileLoginForm(forms.Form):
    username = forms.CharField(label="Username", max_length=100,
                               widget=forms.TextInput(attrs={'placeholder': 'UserName'}))
    password = forms.CharField(label="Password", widget=forms.PasswordInput(attrs={'placeholder': 'Password'}))
    captcha = CaptchaField()


class AddProfileForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        print('sdasdas')
        print(TEACHER_ACCESS)
        print(ADMIN_ACCESS)
        print(user)
        print(user.access_level)
        super(AddProfileForm, self).__init__(*args, **kwargs)
        if user and user.access_level == ADMIN_ACCESS:
            self.fields['access_level'].choices = [(TEACHER_ACCESS,'Teacher'),(STUDENT_ACCESS, 'Student')]
        elif user and user.access_level == TEACHER_ACCESS:
            print(';tttttt')
            self.fields['access_level'].choices = [(STUDENT_ACCESS, 'Student')]
    class Meta:
        model = Profile
        fields = ['entry_year', 'major_code', 'username', 'password', 'access_level']

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.password = make_password(self.cleaned_data['password'])
        if commit:
            instance.save()
        return instance


# class AddProfileForm(forms.Form):
#     username = forms.CharField(label="Username", max_length=100,
#                                widget=forms.TextInput(attrs={'placeholder': 'UserName'}))
#     password = forms.CharField(label="Password", widget=forms.PasswordInput(attrs={'placeholder': 'Password'}))
#     entry_year = forms.CharField(required=False)
#     major_code = forms.CharField(required=False)