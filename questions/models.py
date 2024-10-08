from django.db import models
from .utils import audio_path, image_path
from exams.models import Exam


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now=True)
    modified_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class QuestionBank(BaseModel):
    name = models.CharField(max_length=200)


# Create your models here.
# todo: rename question group
class QuestionGroup(BaseModel):
    name = models.CharField(max_length=200)
    # exam = models.ManyToManyField(Exam,
    #                                 related_name='question_groups',
    #                                 related_query_name='question_group', )
    # TODO manytomany

    exam = models.ForeignKey(
        Exam, blank=True, null=True, on_delete=models.CASCADE,
        related_name='exam_question_groups', related_query_name='exam_question_group',
    )
    q_bank = models.ForeignKey(
        QuestionBank, blank=True, null=True, on_delete=models.CASCADE,
        related_name='q_bank_q_groups', related_query_name='q_bank_q_group',
    )

    # def __str__(self):
    #     return self.name


class Question(BaseModel):
    description = models.TextField(blank=True)
    image = models.ImageField(blank=True, upload_to=image_path)
    audio = models.FileField(upload_to=audio_path, blank=True, )
    score = models.PositiveIntegerField(default=0, null=True)
    question_group = models.ForeignKey(
        QuestionGroup, blank=True, null=True, on_delete=models.CASCADE,
        related_name='question_group_questions', related_query_name='question_group_question',
    )

    class QuestionType(models.TextChoices):
        MATCHING = 'MG', 'MATCHING'
        MULTIPLE_CHOICE = 'MC', 'MULTIPLE_CHOICE'
        TRUE_FALSE = 'TF', 'TRUE_FALSE'

    question_type = models.CharField(
        max_length=2,
        choices=QuestionType.choices,
        default=QuestionType.TRUE_FALSE
    )

    def get_short_description(self):
        return self.description[:20]


class Choice(BaseModel):
    question = models.ForeignKey(
        to='Question',
        related_name='question_choices',
        related_query_name='question_choice',
        on_delete=models.CASCADE,
    )
    choice_text = models.CharField(max_length=200)  # Add this field
    is_true = models.BooleanField(blank=True, null=True)

    def __str__(self):
        return self.choice_text


class Match(BaseModel):
    question = models.ForeignKey(
        to='Question',
        related_name='question_matches',
        related_query_name='question_match',
        on_delete=models.CASCADE,
    )
    item_text = models.CharField(max_length=200, null=True)  # Add this field
    match_text = models.CharField(max_length=200, null=True)  # Add this field


class Answer(BaseModel):
    question = models.ForeignKey(
        'Question',
        related_name='question_answers',
        related_query_name='question_answer',
        on_delete=models.CASCADE,
    )

    # Define fields for the answer data
    matching_choices = models.JSONField(blank=True, null=True)  # For Matching questions
    multiple_choice_option = models.ForeignKey(
        'Choice',
        related_name='selected_as_answer',
        related_query_name='selected_as_answer',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )  # For Multiple Choice questions
    is_true = models.BooleanField(blank=True, null=True)  # For True/False questions

    def __str__(self):
        return f"Answer for Question: {self.question}"


# todo: delete this model in future
class QuestionTrueFalse(Question):
    true_false = models.BooleanField(default=False)
