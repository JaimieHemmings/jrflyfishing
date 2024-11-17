from django.shortcuts import render

def thoughts(request):
    return render(request, 'thoughts/thoughts.html')
