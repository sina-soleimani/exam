from django.urls import path, include
from django.contrib import admin
from core import views as project_views
from .views import CourseListView, CourseCreateView, CourseUpdateView
from taker import urls as taker_url

app_name = 'courses'

urlpatterns = [
    path('list', CourseListView.as_view(), name='courselist'),

    path('course_submit/', CourseCreateView.as_view(), name='create_course'),

    path('<int:pk>/update/', CourseUpdateView.as_view(), name='update_course'),

]
