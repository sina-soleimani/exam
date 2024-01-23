# from django.conf.urls import path
from .views import QuestionGroupDelete, QuestionSort, CreateUpdateTrueFalseQuestionView, MyForm, QBank, \
    CreateUpdateMultiQuestionView, CreateUpdateMatchingQuestionView, upload_q_excel
from django.urls import path, include

app_name = 'question'
urlpatterns = [
    path('<str:id>/delete/', QuestionGroupDelete.as_view(), name='question_group_delete_url'),
    path('<str:id>/sort_questions/', QuestionSort.as_view(), name='question_sort_url'),
    # For creating a new question
    path('true_false_question/', CreateUpdateTrueFalseQuestionView.as_view(), name='true_false_question'),
    path('multi_question/', CreateUpdateMultiQuestionView.as_view(), name='multiple_question'),
    path('multi_question/<int:question_id>/', CreateUpdateMultiQuestionView.as_view(), name='multiple_question'),
    path('matching_question/<int:question_id>/', CreateUpdateMatchingQuestionView.as_view(), name='matching_question'),

    # For updating an existing question with a known question_id
    path('true_false_question/<int:question_id>/', CreateUpdateTrueFalseQuestionView.as_view(),
         name='true_false_question'),
    path('matching_question/', CreateUpdateMatchingQuestionView.as_view(), name='matching_question'),
    path('upload_q_excel/', upload_q_excel, name='upload_q_excel'),

    path('<str:id>/form', MyForm.as_view(), name='formList'),
    path('<str:id>/q_bank', QBank.as_view(), name='qBank'),

]


