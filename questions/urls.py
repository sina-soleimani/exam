# from django.conf.urls import path
from .views import QuestionGroupDelete, QuestionSort, CreateUpdateTrueFalseQuestionView, MyForm, CreateQuestion
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

app_name = 'question'
urlpatterns = [
    path('<str:id>/delete/', QuestionGroupDelete.as_view(), name='question_group_delete_url'),
    path('<str:id>/sort_questions/', QuestionSort.as_view(), name='question_sort_url'),
    path('true_false_question/', CreateUpdateTrueFalseQuestionView.as_view(), name='true_false_question'),

    path('<str:id>/form', MyForm.as_view(), name='formList'),

    path('create_question/', CreateQuestion.as_view(), name='createQuestion'),
]


