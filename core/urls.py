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
from questions import urls as q_urls
from taker import urls as taker_url
from exams import urls as exam_urls

urlpatterns = [
    path('builder/', include(q_urls)),
    path('taker/', include(taker_url)),
    path('exams/', include(exam_urls)),

    path('admin/', admin.site.urls),

    path("", include("authentication.urls")),  # Auth routes - login / register
    path("", include("home.urls")),
]
