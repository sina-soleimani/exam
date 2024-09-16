
from django.urls import path, include
from django.contrib import admin
from core import views as project_views
from .views import ExamListView, ExamCreateView, StudentExamListView
from taker import urls as taker_url

app_name = 'exams'

urlpatterns = [
    path('list', ExamListView.as_view(), name='examlist'),
    path('student_exam', StudentExamListView.as_view(), name='studentExamList'),
    path('exam_submit/', ExamCreateView.as_view(), name='createQuestion'),
]
