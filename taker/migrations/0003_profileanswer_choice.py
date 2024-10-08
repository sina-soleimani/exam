# Generated by Django 4.2.4 on 2023-11-21 18:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('questions', '0008_alter_question_question_type'),
        ('taker', '0002_alter_profileanswer_question_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='profileanswer',
            name='choice',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='choice_prof_answers', related_query_name='choice_prof_answer', to='questions.choice'),
        ),
    ]
