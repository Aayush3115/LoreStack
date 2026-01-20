from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')
    mood_name = serializers.ReadOnlyField(source='mood.name')

    class Meta:
        model = Post
        fields = [
            'id',
            'author',
            'author_username',
            'title',
            'content',
            'mood',
            'mood_name',
            'tags',
            'rating',
            'created_at'
        ]
        read_only_fields = ['author']
