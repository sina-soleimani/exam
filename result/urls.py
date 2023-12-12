from django.urls import path
from .views import ResultListView, calc_result, ResultDetailListView, ResultDetailView

app_name = 'results'

urlpatterns = [
    path('list/<int:id>', ResultListView.as_view(), name='resultList'),
    path('calc_result/', calc_result, name='calc_result'),
    path('details/<int:id>', ResultDetailView.as_view(), name='resultDetails'),

]
