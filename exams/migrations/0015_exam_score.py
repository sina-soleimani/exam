# Generated by Django 4.2.4 on 2023-12-08 15:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exams', '0014_rename_question_type_exam_exam_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='exam',
            name='score',
            field=models.PositiveIntegerField(default=0, null=True),
        ),
    ]
