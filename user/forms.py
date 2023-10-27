from django import forms
from .models import Profile
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm


class ProfileCreationForm(UserCreationForm):
    class Meta:
        model = Profile
        fields = ('username', 'email', 'password1', 'password2')


class ProfileLoginForm(AuthenticationForm):
    class Meta:
        model = Profile
