from django.db import models
from ckeditor.fields import RichTextField
import random
from django.template.defaultfilters import slugify
import string
import uuid

class Experience(models.Model):
    
    def get_path(self, filename):
        ext = filename.split('.')[-1]
        filename = f"{filename}-{uuid.uuid4()}.{ext}"
        return f"thoughts/img/{filename}"
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
        )
    thumbnail = models.ImageField(
        upload_to=get_path,
        help_text='Thumbnail of the experience',
        default='No thumbnail provided'
        )
    banner_image = models.ImageField(
        upload_to=get_path,
        help_text='Banner image of the experience',
        default='No banner image provided'
        )
    title = models.CharField(max_length=255, help_text='Name of the service')
    slug = models.SlugField(max_length=255, help_text='Slug of the service for SEO purposes')
    excerpt = models.TextField(
        help_text='Short description of the service',
        default='No excerpt provided'
        )
    text = RichTextField(help_text='Description of the service')

    def save(self, *args, **kwargs):
        if not self.slug or self.title_has_changed():
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def title_has_changed(self):
        if not self.pk:
            return True
        original = Experience.objects.get(pk=self.pk)
        return original.title != self.title

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
