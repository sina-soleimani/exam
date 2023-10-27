from django.db import models
from datetime import date
# Create your models here.


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

