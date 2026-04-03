from django.db import models

class Mood(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    color_vibe = models.CharField(max_length=20, default="#000000")

    def __str__(self):
        return self.name

class MediaMood(models.Model):
    MEDIA_TYPES = [
        ('movie', 'Movie'),
        ('tv', 'TV'),
        ('anime', 'Anime'),
    ]

    media_id = models.IntegerField()
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES)
    moods = models.ManyToManyField(Mood, related_name='media_items')
    
    class Meta:
        unique_together = ('media_id', 'media_type')