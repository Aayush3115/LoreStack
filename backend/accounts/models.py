from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
        bio = models.TextField(blank=True)
        avatar = models.URLField(blank=True)
        preferred_moods = models.ManyToManyField(
        'moods.Mood',
        blank=True,
        related_name='preferred_by_users'
    )

        def __str__(self):
            return self.username
