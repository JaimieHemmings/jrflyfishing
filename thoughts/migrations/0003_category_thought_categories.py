# Generated by Django 5.1.3 on 2024-11-17 11:38

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('thoughts', '0002_alter_thought_text'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(help_text='Name of the category', max_length=255)),
                ('slug', models.SlugField(help_text='Slug of the category for SEO purposes', max_length=255)),
                ('description', models.TextField(help_text='Description of the category for SEO purposes')),
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='Date and time of creation')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='Date and time of last update')),
            ],
        ),
        migrations.AddField(
            model_name='thought',
            name='categories',
            field=models.ManyToManyField(help_text='Categories of the thought', to='thoughts.category'),
        ),
    ]
