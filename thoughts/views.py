from django.shortcuts import render
from .models import Thought, Category
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404


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
    next_articles = Thought.objects.all().order_by("-created_at")[:3]
    context = {
        'article': article,
        'next_articles': next_articles
    }
    return render(request, 'thoughts/thought_detail.html', context)


def category_search(request, slug):
    category = get_object_or_404(Category, name=slug)
    paginator = Paginator(Thought.objects.filter(categories=category).order_by("-created_at"), 5)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    context = {
        'page_obj': page_obj,
        'category': category
    }
    return render(request, 'thoughts/category_search.html', context)