from django.contrib import admin
from .models import Vote, Comment

# Register your models here.

admin.site.register(Vote)
admin.site.register(Comment)