# Generated by Django 5.1.3 on 2024-11-17 11:12

import thoughts.models
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Thought',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('meta_description', models.TextField(help_text='Description of the thought for SEO purposes')),
                ('slug', models.SlugField(help_text='Slug of the thought for SEO purposes', max_length=255)),
                ('banner_image', models.ImageField(help_text='Image of the thought', upload_to=thoughts.models.Thought.get_path)),
                ('thumbnail_image', models.ImageField(help_text='Thumbnail image of the thought', upload_to=thoughts.models.Thought.get_path)),
                ('title', models.CharField(help_text='Title of the thought', max_length=255)),
                ('text', models.TextField(help_text='Content of the thought')),
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='Date and time of creation')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='Date and time of last update')),
                ('publication_date', models.DateField(auto_now_add=True, help_text='Date of publication')),
            ],
        ),
    ]