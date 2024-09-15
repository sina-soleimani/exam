from django.db import models

# Create your models here.

from django.contrib.auth.models import AbstractUser


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now=True)
    modified_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class AccessLevel(BaseModel):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

STUDENT_ACCESS = 'S'
TEACHER_ACCESS = 'T'
ADMIN_ACCESS = 'A'
HEAD_ADMIN_ACCESS = 'H'
ACCESS_LEVEL_CHOICES = [
    (STUDENT_ACCESS, 'Student'),
    (ADMIN_ACCESS, 'Admin'),
    (HEAD_ADMIN_ACCESS, 'Head Admin'),
    (TEACHER_ACCESS, 'Teacher'),
]
class Profile(AbstractUser):


    access_level = models.CharField(max_length=1, choices=ACCESS_LEVEL_CHOICES, blank=True, null=True)


    entry_year = models.CharField(null=True, blank=True)
    major_code = models.CharField(null=True, blank=True)

    def __str__(self):
        return self.username
