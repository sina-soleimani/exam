# Generated by Django 4.2.4 on 2024-02-28 15:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0005_alter_profile_access_level'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='access_level',
            field=models.CharField(blank=True, choices=[('S', 'Student'), ('A', 'Admin'), ('T', 'Teacher')], max_length=1, null=True),
        ),
    ]
