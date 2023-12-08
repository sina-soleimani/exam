from django.urls import path
from .views import ResultListView, calc_result, ResultDetailListView

app_name = 'results'

urlpatterns = [
    path('list/<int:id>', ResultListView.as_view(), name='resultList'),
    path('details/<int:id>', ResultDetailListView.as_view(), name='resultDetails'),
    path('calc_result/', calc_result, name='calc_result'),

]
