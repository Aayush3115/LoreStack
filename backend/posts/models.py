from django.db import models
from accounts.models import User
from communities.models import Community

class Post(models.Model):
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    community = models.ForeignKey(
        Community,
        on_delete=models.CASCADE,
        related_name='posts',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.author.username}'s post in {self.community.name if self.community else 'General'}"
