from django.contrib import admin
from .models import User, EmailVerification
from django.contrib.auth.admin import UserAdmin

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('bio', 'profile_picture', 'preferred_moods', 'email_verified')}),
    )
    list_display = ('username', 'email', 'is_staff', 'email_verified')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'email_verified')

admin.site.register(User, CustomUserAdmin)
admin.site.register(EmailVerification)