from django.shortcuts import render
from .forms import ContactForm
from thoughts.models import Thought
from reviews.models import Review


def contact(request):
    thoughts = Thought.objects.all()[:3]
    reviews = Review.objects.all()
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
        'reviews': reviews,
    }

    return render(request, 'contact/contact.html', context)
