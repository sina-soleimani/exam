from django.urls import path
from .views import ResultListView

app_name = 'results'

urlpatterns = [
    path('<int:id>/list', ResultListView.as_view(), name='resultlist'),

]
