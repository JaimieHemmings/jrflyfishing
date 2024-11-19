from django.db import models
from django.template.defaultfilters import slugify
import uuid
import random
import string
from ckeditor.fields import RichTextField


class Category(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
        )
    name = models.CharField(
        max_length=255,
        help_text='Name of the category'
        )
    slug = models.SlugField(
        max_length=255,
        help_text='Slug of the category for SEO purposes'
        )
    description = models.TextField(
        help_text='Description of the category for SEO purposes'
        )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Date and time of creation'
        )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text='Date and time of last update'
        )

    def save(self, *args, **kwargs):
        self.slug = self.generate_slug()
        return super().save(*args, **kwargs)

    def generate_slug(self, save_to_obj=False, add_random_suffix=True):
        generated_slug = slugify(self.name)

        random_suffix = ""
        if add_random_suffix:
            random_suffix = ''.join([
                random.choice(string.ascii_letters + string.digits)
                for i in range(5)
            ])
            generated_slug += '-%s' % random_suffix

        if save_to_obj:
            self.slug = generated_slug
            self.save(update_fields=['slug'])

        return generated_slug

    def __str__(self):
        return self.name


class Thought(models.Model):

    def get_path(self, filename):
        ext = filename.split('.')[-1]
        filename = f"{filename}-{uuid.uuid4()}.{ext}"
        return f"thoughts/img/{filename}"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
        )
    meta_description = models.TextField(
        help_text='Description of the thought for SEO purposes'
        )
    slug = models.SlugField(
        max_length=255,
        help_text='Slug of the thought for SEO purposes'
        )
    excerpt = models.TextField(
        max_length="220",
        help_text='Small snippet of the thought for previews',
        default='No excerpt provided'
        )

    banner_image = models.ImageField(
        upload_to=get_path,
        help_text='Image of the thought'
        )
    thumbnail_image = models.ImageField(
        upload_to=get_path,
        help_text='Thumbnail image of the thought'
        )

    categories = models.ManyToManyField(
        Category,
        help_text='Categories of the thought'
        )

    title = models.CharField(
        max_length=255,
        help_text='Title of the thought'
        )
    text = RichTextField()

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Date and time of creation'
        )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text='Date and time of last update'
        )
    publication_date = models.DateField(
        auto_now_add=True,
        help_text='Date of publication'
        )

    def save(self, *args, **kwargs):
        self.slug = self.generate_slug()
        return super().save(*args, **kwargs)

    def generate_slug(self, save_to_obj=False, add_random_suffix=True):
        generated_slug = slugify(self.title)

        random_suffix = ""
        if add_random_suffix:
            random_suffix = ''.join([
                random.choice(string.ascii_letters + string.digits)
                for i in range(5)
            ])
            generated_slug += '-%s' % random_suffix

        if save_to_obj:
            self.slug = generated_slug
            self.save(update_fields=['slug'])

        return generated_slug

    def __str__(self):
        return self.title
