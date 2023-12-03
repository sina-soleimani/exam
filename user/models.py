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


class Profile(AbstractUser):
    # Add any additional fields you need for your user model here
    # For example, you might want to add a profile picture or user type.
    # Just define them as regular fields.
    # access_level = models.ForeignKey(AccessLevel, on_delete=models.PROTECT)
    ACCESS_LEVEL_CHOICES = [
        ('S', 'Student'),
        ('A', 'Admin'),
    ]

    access_level = models.CharField(max_length=10, choices=ACCESS_LEVEL_CHOICES, blank=True, null=True)

    # username = models.CharField(max_length=30, unique=True)
    # email = models.EmailField(unique=True)
    # first_name = models.CharField(max_length=30, blank=True)
    # last_name = models.CharField(max_length=30, blank=True)
    # is_active = models.BooleanField(default=True)
    entry_year = models.CharField(null=True, blank=True)
    major_code = models.CharField(null=True, blank=True)

    def __str__(self):
        return self.username
