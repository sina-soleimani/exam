# Generated by Django 4.2.4 on 2023-11-20 12:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('questions', '0007_alter_question_score'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='question_type',
            field=models.CharField(choices=[('MG', 'MATCHING'), ('MC', 'MULTIPLE_CHOICE'), ('TF', 'TRUE_FALSE')], default='TF', max_length=2),
        ),
    ]
