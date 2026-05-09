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

class MovieActivity(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    movie_id = models.IntegerField()
    is_watchlist = models.BooleanField(default=False)
    is_logged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'movie_id')

    def __str__(self):
        return f"{self.user.username} - {self.movie_id} Activity"

class TVRating(models.Model):
    RATING_CHOICES = [
        ('skip', 'Skip'),
        ('timepass', 'Timepass'),
        ('goforit', 'Go For It'),
        ('perfection', 'Perfection'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tv_id = models.IntegerField()  
    rating = models.CharField(max_length=20, choices=RATING_CHOICES)
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'tv_id')

    def __str__(self):
        return f"{self.user.username} - {self.tv_id}: {self.rating}"

class TVActivity(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tv_id = models.IntegerField()
    is_watchlist = models.BooleanField(default=False)
    is_logged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'tv_id')

    def __str__(self):
        return f"{self.user.username} - {self.tv_id} Activity"

class AnimeRating(models.Model):
    RATING_CHOICES = [
        ('skip', 'Skip'),
        ('timepass', 'Timepass'),
        ('goforit', 'Go For It'),
        ('perfection', 'Perfection'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    anime_id = models.IntegerField()  
    rating = models.CharField(max_length=20, choices=RATING_CHOICES)
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'anime_id')

    def __str__(self):
        return f"{self.user.username} - {self.anime_id}: {self.rating}"

class AnimeActivity(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    anime_id = models.IntegerField()
    is_watchlist = models.BooleanField(default=False)
    is_logged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'anime_id')

    def __str__(self):
        return f"{self.user.username} - {self.anime_id} Activity"

class UserFavorite(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('movie', 'Movie'),
        ('tv', 'TV Series'),
        ('anime', 'Anime'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    media_id = models.IntegerField()
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    poster_path = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'media_id', 'media_type')
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user.username}'s favorite: {self.title} ({self.media_type})"
