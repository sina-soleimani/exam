from django.contrib.auth import login, authenticate
from django.shortcuts import render, redirect
from .forms import ProfileCreationForm, ProfileLoginForm
from django.contrib.auth.views import LogoutView
from django.urls import reverse_lazy
from django.http import JsonResponse
import openpyxl
import json
from decimal import Decimal
from .models import Profile
from django.views.generic import ListView
from django.db import transaction
from django.contrib.auth.hashers import make_password

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from decorator import access_level_required
from user.models import STUDENT_ACCESS, ADMIN_ACCESS


def register(request):
    if request.method == 'POST':
        form = ProfileCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('/login/')
    else:
        form = ProfileCreationForm()
    return render(request, 'registration/register.html', {'form': form})


def user_login(request):
    if request.method == 'POST':
        form = ProfileLoginForm(data=request.POST)
        if form.is_valid():
            # Retrieve username and password from the form
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')

            # Use authenticate to get the user object
            user = authenticate(request, username=username, password=password)

            if user is not None:
                # Log in the user
                login(request, user)
                return redirect('home')
    else:
        form = ProfileLoginForm()
    return render(request, 'registration/login.html', {'form': form})


class UserLogoutView(LogoutView):
    next_page = reverse_lazy('user:login')


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)


class UserListView(ListView):
    model = Profile
    template_name = 'home/profile-mangar.html'
    context_object_name = 'profiles'

    @access_level_required(ADMIN_ACCESS)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        profiles = self.get_queryset()
        print(profiles)

        profiles_data = [{
            'id': pf.id,
            'entry_year': pf.entry_year,
            'major_code': pf.major_code,
            'username': pf.username,
        } for pf in profiles]
        profiles_json = json.dumps(profiles_data, cls=DecimalEncoder, indent=4, sort_keys=True, default=str)
        context['profiles_json'] = profiles_json
        return context


@access_level_required(ADMIN_ACCESS)
def upload_excel(request):
    if request.method == 'POST' and request.FILES['excelFile']:

        excel_file = request.FILES['excelFile']

        with transaction.atomic():
            workbook = openpyxl.load_workbook(excel_file, data_only=True)
            sheet = workbook.active

            max_row = sheet.max_row

            for row in range(2, max_row + 1):
                row_data = [cell.value for cell in sheet[row]]

                new_data = [item for item in row_data if item is not None]

                if new_data:
                    existing_user = Profile.objects.filter(username=new_data[0]).first()

                    if existing_user:
                        existing_user.password = make_password(str(new_data[1]))
                        existing_user.major_code = new_data[3]
                        existing_user.access_level = new_data[4]
                        existing_user.entry_year = new_data[2]
                        existing_user.save()
                    else:
                        Profile.objects.create(username=new_data[0], password=make_password(str(new_data[1])),
                                               major_code=new_data[3], access_level=new_data[4], entry_year=new_data[2])
        return JsonResponse({'message': 'File uploaded successfully'})
    return JsonResponse({'message': 'Please select a file to upload.'})


@access_level_required(STUDENT_ACCESS)
@login_required
def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Important for security
            messages.success(request, 'Your password was successfully updated!')
            return redirect('/logout/')
        else:
            messages.error(request, 'Please correct the error below.')
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'home/password-change.html', {'form': form})
