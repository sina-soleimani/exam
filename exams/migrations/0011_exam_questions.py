# Generated by Django 4.2.4 on 2023-12-03 17:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('questions', '0008_alter_question_question_type'),
        ('exams', '0010_exam_course'),
    ]

    operations = [
        migrations.AddField(
            model_name='exam',
            name='questions',
            field=models.ManyToManyField(blank=True, null=True, related_name='question_exams', related_query_name='question_exam', to='questions.question'),
        ),
    ]
