from django.urls import path
from . import views

urlpatterns = [
    path('', views.thoughts, name='thoughts'),
]