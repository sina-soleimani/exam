from django.contrib.auth import login
from django.shortcuts import render, redirect
from .forms import ProfileCreationForm, ProfileLoginForm


def register(request):
    if request.method == 'POST':
        form = ProfileCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('login')
    else:
        form = ProfileCreationForm()
    return render(request, 'registration/register.html', {'form': form})


def user_login(request):
    if request.method == 'POST':
        form = ProfileLoginForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('home')
    else:
        form = ProfileLoginForm()
    return render(request, 'registration/login.html', {'form': form})
