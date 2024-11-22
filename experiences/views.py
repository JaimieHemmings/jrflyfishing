from django.shortcuts import render
from .models import Experience

def experiences(request):
    experiences = Experience.objects.all().sort_by('-created_at')
    context = {
        'experiences': experiences
    }
    return render(request, 'experiences/experiences.html', context)


def experience_detail(request, slug):
    experience = Experience.objects.get(slug=slug)
    context = {
        'experience': experience
    }
    return render(request, 'experiences/experiences-detail.html', context)
