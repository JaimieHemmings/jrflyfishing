from django.contrib import admin
from .models import Experience


class ExperienceAdmin(admin.ModelAdmin):
    exclude = ('slug', 'id')


admin.site.register(Experience, ExperienceAdmin)
