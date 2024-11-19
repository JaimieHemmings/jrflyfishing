from django.urls import path
from . import views

urlpatterns = [
    path('', views.thoughts, name='thoughts'),
    path('<slug:slug>/', views.thought_detail, name='thought_detail'),
]