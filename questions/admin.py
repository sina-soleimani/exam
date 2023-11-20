from django.contrib import admin
from .models import Question, QuestionTrueFalse,QuestionGroup, Answer, Choice, QuestionBank , Match
# Register your models here.

admin.site.register(Question)
admin.site.register(QuestionTrueFalse)
admin.site.register(QuestionGroup)
admin.site.register(QuestionBank)
admin.site.register(Answer)
admin.site.register(Choice)
admin.site.register(Match)