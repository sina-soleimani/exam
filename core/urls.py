"""core URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.urls import path, include
from django.contrib import admin
from core import views as project_views
from questions import views, urls
from taker import urls as taker_url
from exams.views import ExamList, ExamSubmit




urlpatterns = [
    path('tasks/', include(urls)),
    path('taker/', include(taker_url)),
    path('create_question/', views.CreateQuestion.as_view(), name='createQuestion'),
    path('exam_submit/', ExamSubmit.as_view(), name='createQuestion'),
    #
    path('exams', ExamList.as_view(), name='examlist'),

    path('admin/', admin.site.urls),
    path('<str:id>/form', views.MyForm.as_view(), name='formList'),
    # Django admin route
    path("", include("authentication.urls")),  # Auth routes - login / register
    path("", include("home.urls")),
]
