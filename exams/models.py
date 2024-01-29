from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


# Create your models here.


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Exam(BaseModel):
    label = models.CharField(max_length=200)
    deadline = models.DateField(blank=True, null=True)
    active_time = models.DateTimeField(blank=True, null=True)
    duration = models.DurationField(default=None)
    action = models.BooleanField(default=False)
    score = models.PositiveIntegerField(default=0, null=True)
    avg_score = models.PositiveIntegerField(default=0, null=True)
    course = models.ForeignKey(
        'course.Course',
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        related_name='course_exams',
    )

    questions = models.ManyToManyField(
        'questions.Question', related_name='question_exams',
        related_query_name='question_exam',
        blank=True,
        null=True
    )

    class ScoreType(models.TextChoices):
        PERCENT = 'PE', 'PERCENT'
        POINT = 'PO', 'POINT'

    score_type = models.CharField(
        max_length=2,
        choices=ScoreType.choices,
        default=ScoreType.POINT
    )
    percent_passing_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True
    )
    point_passing_score = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True
    )

    incorrect_penalty = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True
    )
    unanswered_penalty = models.BooleanField(default=False)
    shuffle_answer = models.BooleanField(default=True)
    manual_chosen = models.BooleanField(default=False)

    class ExamStatus(models.TextChoices):
        READY = 'R', 'READY'
        ACTIVE = 'A', 'ACTIVE'
        EXPIRE = 'E', 'EXPIRE'

    exam_status = models.CharField(
        max_length=2,
        choices=ExamStatus.choices,
        default=ExamStatus.READY
    )

    def __str__(self):
        return self.label
