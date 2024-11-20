from django.shortcuts import render
from .forms import ContactForm
from thoughts.models import Thought


def contact(request):
    thoughts = Thought.objects.all()[:3]
    form = ContactForm()
    success = False

    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            success = True

    context = {
        'form': form,
        'success': success,
        'thoughts': thoughts,
    }

    return render(request, 'contact/contact.html', context)
