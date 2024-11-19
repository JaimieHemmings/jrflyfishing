from django.contrib import admin
from .models import Review


# Register your models here.
class ReviewAdmin(admin.ModelAdmin):
    search_fields = ['title']
    list_display = ('title', 'created_at', 'name')


admin.site.register(Review, ReviewAdmin)