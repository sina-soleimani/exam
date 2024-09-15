
from django.urls import path
from .views import examSession,AnswerQuestionView, ExamDoneView

app_name = 'taker'

urlpatterns = [
    path('<str:id>/exam_session', examSession.as_view(), name='examSession'),
    path('answer_question/<int:id>', AnswerQuestionView.as_view(), name='answer_question'),
    path('exam_done/<int:id>', ExamDoneView.as_view(), name='exam_done'),
]
