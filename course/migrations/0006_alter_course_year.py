# Generated by Django 4.2.4 on 2024-01-10 16:00

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('course', '0005_alter_course_group_code'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='year',
            field=models.DateField(default=datetime.date(2024, 1, 1)),
        ),
    ]