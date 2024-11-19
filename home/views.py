from django.shortcuts import render
from reviews.models import Review

def home(request):
    reviews = Review.objects.all()
    context = {
        'reviews': reviews
    }
    return render(request, 'home/index.html', context)

def about(request):
    return render(request, 'about/about.html')
