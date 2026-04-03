from rest_framework import serializers
from .models import Comment, Vote

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


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = [
            'id',
            'user',
            'post',
            'vote_type',
            'created_at'
        ]
        read_only_fields = ['user']
