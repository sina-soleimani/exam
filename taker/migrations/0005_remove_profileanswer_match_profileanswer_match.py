# Generated by Django 4.2.4 on 2023-11-24 17:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('taker', '0004_profmatch_profileanswer_match'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profileanswer',
            name='match',
        ),
        migrations.AddField(
            model_name='profileanswer',
            name='match',
            field=models.ManyToManyField(blank=True, null=True, related_name='match_prof_answers', related_query_name='match_prof_answer', to='taker.profmatch'),
        ),
    ]
