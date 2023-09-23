# from django.conf.urls import path
from .views import QuestionGroupDelete, QuestionSort, CreateUpdateTrueFalseQuestionView, MyForm
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

app_name = 'question'
urlpatterns = [
    path('<str:id>/delete/', QuestionGroupDelete.as_view(), name='question_group_delete_url'),
    path('<str:id>/sort_questions/', QuestionSort.as_view(), name='question_sort_url'),
    # For creating a new question
    path('true_false_question/', CreateUpdateTrueFalseQuestionView.as_view(), name='true_false_question'),

    # For updating an existing question with a known question_id
    path('true_false_question/<int:question_id>/', CreateUpdateTrueFalseQuestionView.as_view(),
         name='true_false_question'),

    path('<str:id>/form', MyForm.as_view(), name='formList'),

]


