# Generated by Django 4.2.4 on 2023-09-16 09:29

from django.db import migrations, models
import django.db.models.deletion
import questions.utils


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('exams', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now=True)),
                ('modified_at', models.DateTimeField(auto_now_add=True)),
                ('description', models.TextField(blank=True)),
                ('image', models.ImageField(blank=True, upload_to=questions.utils.image_path)),
                ('audio', models.FileField(blank=True, upload_to=questions.utils.audio_path)),
                ('score', models.PositiveIntegerField(default=0)),
                ('question_type', models.CharField(choices=[('M', 'MATCHING'), ('MC', 'MULTIPLE_CHOICE'), ('TF', 'TRUE_FALSE')], default='TF', max_length=2)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='QuestionTrueFalse',
            fields=[
                ('question_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='questions.question')),
                ('true_false', models.BooleanField(default=False)),
            ],
            options={
                'abstract': False,
            },
            bases=('questions.question',),
        ),
        migrations.CreateModel(
            name='QuestionGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now=True)),
                ('modified_at', models.DateTimeField(auto_now_add=True)),
                ('name', models.CharField(max_length=200)),
                ('exam', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='exam_question_groups', related_query_name='exam_question_group', to='exams.exam')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='question',
            name='question_group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='question_group_questions', related_query_name='question_group_question', to='questions.questiongroup'),
        ),
        migrations.CreateModel(
            name='Choice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now=True)),
                ('modified_at', models.DateTimeField(auto_now_add=True)),
                ('choice_text', models.CharField(max_length=200)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='question_choices', related_query_name='question_choice', to='questions.question')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Answer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now=True)),
                ('modified_at', models.DateTimeField(auto_now_add=True)),
                ('matching_choices', models.JSONField(blank=True, null=True)),
                ('is_true', models.BooleanField(blank=True, null=True)),
                ('multiple_choice_option', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='selected_as_answer', related_query_name='selected_as_answer', to='questions.choice')),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='question_answers', related_query_name='question_answer', to='questions.question')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
