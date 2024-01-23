from django import forms
from .models import Profile
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django_recaptcha.fields import ReCaptchaField
from captcha.fields import CaptchaField


class ProfileCreationForm(UserCreationForm):
    class Meta:
        model = Profile
        fields = ('username', 'email', 'password1', 'password2')


class ProfileLoginForm(forms.Form):
    username = forms.CharField(label="Username", max_length=100,
                               widget=forms.TextInput(attrs={'placeholder': 'UserName'}))
    password = forms.CharField(label="Password", widget=forms.PasswordInput(attrs={'placeholder': 'Password'}))
    captcha = CaptchaField()
