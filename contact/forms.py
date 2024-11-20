from django import forms
from .models import Contact

class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = ['name', 'email', 'phone', 'message']

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

    def __init__(self, *args, **kwargs):
        super(ContactForm, self).__init__(*args, **kwargs)

        placeholders = {
            'name': 'Your Name',
            'email': 'Your Email',
            'phone': 'Your Phone',
            'message': 'Your Message',
        }

        for field in self.fields:            
            self.fields[field].widget.attrs["placeholder"] = placeholders[field]
            self.fields[field].widget.attrs["required"] = True
            self.fields[field].label = False
