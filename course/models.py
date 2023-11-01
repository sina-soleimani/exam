from django.db import models
from datetime import date


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Course(BaseModel):
    course_name = models.CharField(max_length=200)
    course_code = models.IntegerField(max_length=200)
    group_code = models.IntegerField(max_length=200)
    term = models.IntegerField(max_length=200)
    year = models.DateField(default=date.today().replace(month=1, day=1))
    question_bank = models.ForeignKey(
        'questions.QuestionBank',
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        related_name='q_bank_courses',
    )

    teacher = models.ForeignKey(
        'user.Profile',
        related_name='teacher_courses',
        blank=True,
        null=True,
        on_delete=models.CASCADE)
    students = models.ManyToManyField(
        'user.Profile', related_name='student_courses',
        related_query_name='student_course',
        blank=True,
        null=True
    )

