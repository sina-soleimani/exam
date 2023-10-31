from django.urls import path, include
from django.contrib import admin
from core import views as project_views
from .views import CourseListView
from taker import urls as taker_url

app_name = 'courses'

urlpatterns = [
    path('list', CourseListView.as_view(), name='courselist'),

]
