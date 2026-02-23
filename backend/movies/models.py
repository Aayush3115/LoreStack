from django.db import models
from django.conf import settings

class MovieRating(models.Model):
    RATING_CHOICES = [
        ('skip', 'Skip'),
        ('timepass', 'Timepass'),
        ('goforit', 'Go For It'),
        ('perfection', 'Perfection'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    movie_id = models.IntegerField()  
    rating = models.CharField(max_length=20, choices=RATING_CHOICES)
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'movie_id')

    def __str__(self):
        return f"{self.user.username} - {self.movie_id}: {self.rating}"
