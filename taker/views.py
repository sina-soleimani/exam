from django.shortcuts import render
from django.views.generic import View, ListView
from questions import models, forms
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.generic import CreateView, View
from questions.forms import QustionTrueFalseForm


class examSession(View):
    def get(self, request):
        question_true_false_form = QustionTrueFalseForm()

        return render(request, 'taker.html', context={
            'question_true_false_form': question_true_false_form})

# TODO
# class d(APIView):
# model = models.QuestionTrueFalse
# parser_classes = (MultiPartParser,)

# def get(self, request):
#     questions=models.QuestionTrueFalse.objects.all()
#     form = forms.QuestionGroupForm()
#     questions_forms=forms.QuestionGroupForm(questions)

# return render(request, 'taker.html', context={
#
# 'questions_forms': questions_forms})
