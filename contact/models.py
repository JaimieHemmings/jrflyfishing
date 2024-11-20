from django.db import models
from phonenumber_field.modelfields import PhoneNumberField

class Contact(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = PhoneNumberField()
    message = models.TextField()
    read = models.BooleanField(default=False)

    def __str__(self):
        return self.name
