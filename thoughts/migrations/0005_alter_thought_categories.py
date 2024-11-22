# Generated by Django 4.2 on 2024-11-22 11:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('thoughts', '0004_thought_excerpt'),
    ]

    operations = [
        migrations.AlterField(
            model_name='thought',
            name='categories',
            field=models.ManyToManyField(help_text='Categories of the thought', related_name='thoughts', to='thoughts.category'),
        ),
    ]
