from django.contrib import admin
from .models import Thought, Category


class ThoughtAdmin(admin.ModelAdmin):
  exclude = ('slug', 'id', 'created_at', 'updated_at')


class CategoryAdmin(admin.ModelAdmin):
  exclude = ('slug', 'id', 'created_at', 'updated_at')


admin.site.register(Category, CategoryAdmin)
admin.site.register(Thought, ThoughtAdmin)
