# Generated by Django 4.2.4 on 2023-11-19 15:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('questions', '0006_alter_match_item_text_alter_match_match_text'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='score',
            field=models.PositiveIntegerField(default=0, null=True),
        ),
    ]