from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
        bio = models.TextField(blank=True)
        profile_picture = models.ImageField(
            upload_to='profile_pics/',
            default='profile_pics/default.jpg'
        )
        preferred_moods = models.ManyToManyField(
        'moods.Mood',
        blank=True,
        related_name='preferred_by_users'
        )

        def __str__(self):
            return self.username
