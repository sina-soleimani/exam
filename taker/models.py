from django.db import models


# Create your models here.


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now=True)
    modified_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class ProfileAnswer(BaseModel):
    question = models.ForeignKey(
        'questions.Question',
        related_name='question_prof_answers',
        related_query_name='question_prof_answer',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    exam = models.ForeignKey(
        'exams.Exam',
        on_delete=models.CASCADE,
        related_name='exam_answer', null=True
    )
    result = models.ForeignKey(
        'result.Result',
        related_name='result_prof_answers',
        related_query_name='result_prof_answer',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    student = models.ForeignKey(
        'user.Profile', blank=True, null=True, on_delete=models.CASCADE,
        related_name='student_answers', related_query_name='student_answer',
    )

    is_true = models.BooleanField(blank=True, null=True)  # For True/False questions

    choice = models.ForeignKey(
        to='questions.Choice',
        blank=True, null=True,
        related_name='choice_prof_answers',
        related_query_name='choice_prof_answer',
        on_delete=models.CASCADE,
    )
    match = models.ManyToManyField('ProfMatch',
                                   blank=True, null=True,
                                   related_name='match_prof_answers',
                                   related_query_name='match_prof_answer',
                                   )

    # def __str__(self):
    #     return f"Answer for Question: {self.question}"


class ProfMatch(BaseModel):
    item_text = models.CharField(max_length=200, null=True)  # Add this field
    match_text = models.CharField(max_length=200, null=True)  # Add this fieldi
    item_id = models.CharField(max_length=200, null=True)  # Add this field
    match_id = models.CharField(max_length=200, null=True)  # Add this field
