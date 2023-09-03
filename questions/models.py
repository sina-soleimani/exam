from django.db import models
from .utils import audio_path, image_path

# from rest
# Create your models here.

class QuestionGroup(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class Question(models.Model):
    description = models.TextField(blank=True)
    image = models.ImageField(blank=True, upload_to=image_path)
    audio = models.FileField(upload_to=audio_path, blank=True)
    barm = models.PositiveIntegerField(default=0)
    queston_group = models.ForeignKey(
        QuestionGroup, blank=True, null=True, on_delete=models.CASCADE,
        related_name='question_group_questions', related_query_name='question_group_question',
    )

class QuestionTrueFalse(Question):
    true_false = models.BooleanField(default=False)
    # QUSETION_TRUE_FALSE_CHOICE = (('True', 'True'),
    #                  ('False', 'False'))
    # choice = models.ChoiceField(choices=QUSETION_TRUE_FALSE_CHOICE)


