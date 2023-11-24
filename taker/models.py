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
    result = models.ForeignKey(
        'result.Result',
        related_name='result_prof_answers',
        related_query_name='result_prof_answer',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    is_true = models.BooleanField(blank=True, null=True)  # For True/False questions

    choice = models.ForeignKey(
        to='questions.Choice',
        blank=True, null=True,
        related_name='choice_prof_answers',
        related_query_name='choice_prof_answer',
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return f"Answer for Question: {self.question}"

