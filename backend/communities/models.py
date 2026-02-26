from django.db import models
from accounts.models import User

# Create your models here.

class Community(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    avatar_icon = models.CharField(max_length=10, default='🌎')
    category = models.CharField(max_length=50, default='General')
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_communities'
    )
    members = models.ManyToManyField(
        User,
        related_name='communities',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.name

class CommunityRequest(models.Model):
    community_name = models.CharField(max_length=100)
    reason = models.TextField()
    requested_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='community_requests'
    )
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Request for {self.community_name} by {self.requested_by.username}"