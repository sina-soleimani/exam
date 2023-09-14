from django.db import models

# Create your models here.



class Exam(models.Model):
    label = models.CharField(max_length=200)
    deadline=models.DateField(blank=True)
    start=models.TimeField(blank=True)
    end =models.TimeField(blank=True)

    def __str__(self):
        return self.label