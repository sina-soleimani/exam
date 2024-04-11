from django.contrib.auth import login, authenticate
from django.shortcuts import render, redirect
from .forms import ProfileCreationForm, ProfileLoginForm
from django.contrib.auth.views import LogoutView
from django.urls import reverse_lazy
from django.http import JsonResponse, HttpResponse
import openpyxl
import json
from decimal import Decimal
from .models import Profile
from django.views.generic import ListView
from django.db import transaction
from django.contrib.auth.hashers import make_password

from .forms import AddProfileForm
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
        print('1')
        form = ProfileLoginForm(data=request.POST)
        if form.is_valid():
            print('2')
            # Retrieve username and password from the form
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')

            # Use authenticate to get the user object
            user = authenticate(request, username=username, password=password)

            if user is not None:
                print('3')
                # Log in the user
                login(request, user)
                return redirect('home')
            else:
                print('55')

                messages.error(request, 'Incorrect username or password.')
        else:
            messages.error(request, 'Incorrect Captcha.')
    else:
        print('4')
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

    def get_queryset(self):
        return self.model.objects.all()

    @access_level_required(ADMIN_ACCESS)
    def get(self, request, *args, **kwargs):
        self.object_list = self.get_queryset()  # Set the object_list attribute
        context = self.get_context_data()
        context['form'] = AddProfileForm(user=request.user)
        return self.render_to_response(context)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        profiles = self.object_list  # Use the object_list attribute
        profiles_data = [{
            'id': pf.id,
            'entry_year': pf.entry_year,
            'major_code': pf.major_code,
            'username': pf.username,
        } for pf in profiles]
        profiles_json = json.dumps(profiles_data, cls=DecimalEncoder, indent=4, sort_keys=True, default=str)
        context['profiles_json'] = profiles_json
        return context
    def post(self, request, *args, **kwargs):
        form = AddProfileForm(request.POST ,user=request.user)
        if form.is_valid():
            # Process the form data and save the new profile
            form.save()
            # Redirect to a success page or perform any other necessary actions
            # return HttpResponse("Profile created successfully")
            return redirect('user:userList')
        else:
            messages.error(request, 'Username is Exist')
            return render(request, 'home/profile-mangar.html', {'form': form})
            # Handle form validation errors or display an error message
            # return HttpResponse("Form is not valid")


@access_level_required(ADMIN_ACCESS)
def upload_excel(request):
    if request.method == 'POST' and request.FILES['excelFile']:
        print(request.user.access_level)

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
                        if request.user.access_level == new_data[4] or new_data[4] == 'A':
                            x=1/0
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
        print('1')
        if form.is_valid():
            print('2')

            user = form.save()
            update_session_auth_hash(request, user)  # Important for security
            messages.success(request, 'Your password was successfully updated!')
            return redirect('/logout/')
        else:
            # print(form)
            # print(form.error_messages)
            # print('3')
            # formatted_messages = "\n".join(f"'{key}': '{value}'" for key, value in form.error_messages.items())
            messages.error(request, ' Passwords Not Match')
            print('55')
    else:
        print('4')
        form = PasswordChangeForm(request.user)
    print('66')
    return render(request, 'home/password-change.html', {'form': form})


def create_profile(request):
    print('32')
    if request.method == 'POST':
        print('1')
        form = AddProfileForm(request.POST , user= request.user)
        if form.is_valid():
            print('2')
            # Save the username, password, entry_year, and major_code
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            entry_year = form.cleaned_data['entry_year']
            major_code = form.cleaned_data['major_code']

            # Create the profile
            profile = Profile(username=username, entry_year=entry_year, major_code=major_code)
            profile.set_password(password)
            profile.save()

            # Redirect to a success page or do something else
            return redirect('success-page')
        else:
            print('errors.log')
        # print(form.error_message)

    else:
        form = AddProfileForm(user= request.user)

    return render(request, 'home/profile-mangar.html', {'form': form})
