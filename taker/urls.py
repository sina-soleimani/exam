# from django.conf.urls import path
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from .views import examSession

urlpatterns = [
    path('exam_session', examSession.as_view(), name='examSession'),
]
