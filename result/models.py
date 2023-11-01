from django.db import models

# Create your models here.

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now=True)
    modified_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class Result(BaseModel):
    name = models.CharField(max_length=200)
    exam = models.ForeignKey(
        'exams.Exam', blank=True, null=True, on_delete=models.CASCADE,
        related_name='exam_results', related_query_name='exam_result',
    )
    student = models.ForeignKey(
        'user.Profile', blank=True, null=True, on_delete=models.CASCADE,
        related_name='student_results', related_query_name='student_result',
    )

