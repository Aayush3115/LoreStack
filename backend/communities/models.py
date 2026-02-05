from django.db import models
from accounts.models import User

# Create your models here.

class Community(models.Model):
    MOOD_CHOICES = [
        ('Dark', 'Dark'),
        ('Light', 'Light'),
        ('Comedy', 'Comedy'),
        ('Emotional', 'Emotional'),
        ('Mysterious', 'Mysterious'),
        ('Inspiring', 'Inspiring'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField()
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES, default='Light')
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