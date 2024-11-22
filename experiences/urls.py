from django.urls import path
from . import views

urlpatterns = [
    path('', views.experiences, name='experiences'),
    path('<slug:slug>/', views.experience_detail, name='experience_detail'),
]