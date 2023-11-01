
from django.urls import path
from .views import examSession,AnswerQuestionView

app_name = 'taker'

urlpatterns = [
    path('<str:id>/exam_session', examSession.as_view(), name='examSession'),
    path('answer_question/<int:id>', AnswerQuestionView.as_view(), name='answer_question'),
]
