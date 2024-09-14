from django.urls import path, include
from .views import ReportListView, ReportFilterView


app_name = 'reports'


urlpatterns = [
    # Other URL patterns
    path('list/', ReportListView.as_view(), name='reportList'),
    path('filter/', ReportFilterView.as_view(), name='report_filter'),
]
