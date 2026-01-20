from rest_framework import serializers
from .models import Comment,Like

class CommentSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Comment
        fields = [
            'id',
            'user',
            'user_username',
            'post',
            'content',
            'created_at'
        ]
        read_only_fields = ['user']


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = [
            'id',
            'user',
            'post',
            'created_at'
        ]
        read_only_fields = ['user']
