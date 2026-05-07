from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
        bio = models.TextField(blank=True)
        profile_picture = models.ImageField(
            upload_to='profile_pics/',
            default='profile_pics/default.jpg'
        )
        email_verified = models.BooleanField(default=False)

        preferred_moods = models.ManyToManyField(
        'moods.Mood',
        blank=True,
        related_name='preferred_by_users'
        )

        following = models.ManyToManyField(
            'self',
            symmetrical=False,
            related_name='followers',
            blank=True
        )

        def __str__(self):
            return self.username

class EmailVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='email_verification')
    otp = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.otp}"
