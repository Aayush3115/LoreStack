from django.contrib import admin
from .models import Community, CommunityRequest

# Register your models here.

admin.site.register(Community)
admin.site.register(CommunityRequest)