from django.shortcuts import render

def experiences(request):
    return render(request, 'experiences/experiences.html')
