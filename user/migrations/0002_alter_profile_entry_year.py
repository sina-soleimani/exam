# Generated by Django 4.2.4 on 2023-10-31 09:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='entry_year',
            field=models.DateField(null=True),
        ),
    ]
