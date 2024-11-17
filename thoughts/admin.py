from django.contrib import admin
from .models import Thought

class ThoughtAdmin(admin.ModelAdmin):
  exclude = ('slug', 'id', 'created_at', 'updated_at')

admin.site.register(Thought, ThoughtAdmin)
