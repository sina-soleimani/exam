# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from django.urls import path, re_path
from home import views

urlpatterns = [

    # The home page
    path('', views.index, name='home'),
    path('exam/index', views.exam_index, name='exam_home'),

    # Matches any html file
    re_path(r'^.*\.*', views.pages, name='pages'),

]
