from django.contrib import admin
from .models import Question, QuestionTrueFalse,QuestionGroup, Answer, Choice
# Register your models here.

admin.site.register(Question)
admin.site.register(QuestionTrueFalse)
admin.site.register(QuestionGroup)
admin.site.register(Answer)
admin.site.register(Choice)