from django.shortcuts import render
from django.views.generic import View, ListView
from questions import models, forms
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.generic import CreateView, View
from questions.models import QuestionTrueFalse
from django.db.models import Sum


class examSession(View):
    def get(self, request):
        questions=QuestionTrueFalse.objects.all()
        sum_bar= questions.aggregate(Sum('score'))

        return render(request, 'taker.html', context={
            'questions': questions, 'sum_bar': sum_bar})

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
