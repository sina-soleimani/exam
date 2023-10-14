from django.shortcuts import render
from django.views.generic import View
from questions import models

# TODO REVIEW THIS IMPORT
from django.db.models import Sum

import json
from django.db.models import OuterRef, Subquery


class examSession(View):
    def get(self, request, id):
        # question_qroups = models.QuestionGroup.objects.filter(exam__pk=id).prefetch_related('question_group_questions')
        question_qroups = models.QuestionGroup.objects.all().prefetch_related('question_group_questions')
        subquery = Subquery(
            models.Answer.objects.filter(
                question=OuterRef('id')
            ).values('is_true')[:1]
        )
        # Annotate 'is_true' for each Question
        question_qroups = question_qroups.annotate(
            question_group_questions__is_true=subquery
        )
        data = []
        for group in question_qroups:
            group_data = {
                'id': group.id,
                'name': group.name,
                'questions': [],
            }

            # Fetch the required fields from questions and answers
            # TODO IMAGE
            questions = group.question_group_questions.values(
                'id', 'description', 'score', 'question_type', 'image',
                'question_answer__is_true',  # Include the 'is_true' field from answers
            )

            for question in questions:
                # Add other answer-related fields here if needed
                group_data['questions'].append(question)

            data.append(group_data)

        json_data = json.dumps(data)

        print(question_qroups)

        return render(request, 'taker.html', context={
            'questionGroupsData': json_data,
            'questions': question_qroups})
