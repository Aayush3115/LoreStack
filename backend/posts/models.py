from django.db import models
from accounts.models import User
from moods.models import Mood

# Create your models here.


class Post(models.Model):
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    mood = models.ForeignKey(
        Mood,
        on_delete=models.SET_NULL,
        null=True,
        related_name='posts'
    )
    tags = models.JSONField(default=list, blank=True)
    rating = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
