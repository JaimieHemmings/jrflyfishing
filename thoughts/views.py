from django.shortcuts import render
from .models import Thought
from django.core.paginator import Paginator

def thoughts(request):
    paginator = Paginator(Thought.objects.all().order_by("-created_at"), 5)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    context = {
        'page_obj': page_obj
    }
    return render(request, 'thoughts/thoughts.html', context)

def thought_detail(request, slug):
    article = Thought.objects.get(slug=slug)
    context = {
        'article': article
    }
    return render(request, 'thoughts/thought_detail.html', context)
