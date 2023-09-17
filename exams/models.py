from django.db import models


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

    def __str__(self):
        return self.label
