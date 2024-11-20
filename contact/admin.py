from django.contrib import admin
from.models import Contact

class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'read')
    search_fields = ('name', 'email', 'phone')
    date_hierarchy = 'created_at'
    ordering = ('read', 'created_at')

admin.site.register(Contact, ContactAdmin)