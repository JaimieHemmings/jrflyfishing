from django.db import models
import uuid

# Create your models here.
class Review(models.Model):
    
    def get_path(self, filename):
        ext = filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        return f"articles/img/{filename}"

    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=100)
    user_img = models.ImageField(upload_to=get_path, blank=True, null=True)

    def __str__(self):
        return self.title