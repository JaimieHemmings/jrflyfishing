from django import forms
from .models import Contact
from django.core.validators import EmailValidator

class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = '__all__'
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'message': forms.Textarea(attrs={'class': 'form-control'}),
        }
        labels = {
            'name': 'Your Name',
            'email': 'Your Email',
            'phone': 'Your Phone',
            'message': 'Your Message',
        }
        help_texts = {
            'name': 'Enter your full name',
            'email': 'Enter your email address',
            'phone': 'Enter your phone number',
            'message': 'Enter your message',
        }
        error_messages = {
            'name': {
                'required': 'This field is required',
            },
            'email': {
                'required': 'This field is required',
                'invalid': 'Enter a valid email address',
            },
            'phone': {
                'required': 'This field is required',
            },
            'message': {
                'required': 'This field is required',
            },
        }