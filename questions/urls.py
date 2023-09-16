# from django.conf.urls import path
from .views import QuestionGroupDelete, QuestionSort
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

urlpatterns = [
    path('<str:id>/delete/', QuestionGroupDelete.as_view(), name='task_delete_url'),
    path('<str:id>/sort_questions/', QuestionSort.as_view(), name='question_sort_url'),

]


