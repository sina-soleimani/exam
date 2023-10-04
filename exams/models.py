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
    deadline = models.DateField(blank=True)
    duration = models.DurationField(default=None)
    action = models.BooleanField(default=False)

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

    def __str__(self):
        return self.label
