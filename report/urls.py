from django.urls import path, include
from .views import ReportListView


app_name = 'reports'

urlpatterns = [
    path('list', ReportListView.as_view(), name='reportList'),

]
