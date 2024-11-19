from django.shortcuts import render
from reviews.models import Review
from thoughts.models import Thought

def home(request):
    reviews = Review.objects.all()
    homepage_thoughts = Thought.objects.all().order_by("-created_at")[:3]
    context = {
        'reviews': reviews,
        'homepage_thoughts': homepage_thoughts
    }
    return render(request, 'home/index.html', context)

def about(request):
    return render(request, 'about/about.html')
