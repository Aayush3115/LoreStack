from rest_framework import serializers
from .models import Comment, Vote

class CommentSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    user_profile_picture = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id',
            'user',
            'user_username',
            'user_profile_picture',
            'post',
            'parent',
            'content',
            'created_at',
            'replies'
        ]
        read_only_fields = ['user']

    def get_user_profile_picture(self, obj):
        request = self.context.get('request')
        default_path = '/media/profile_pics/default.jpg'
        
        if obj.user.profile_picture:
            try:
                url = obj.user.profile_picture.url
                if url and 'default.jpg' not in url:
                    if request:
                        return request.build_absolute_uri(url)
                    return url
            except Exception:
                pass
                
        if request:
            return request.build_absolute_uri(default_path)
        return default_path


    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(
                obj.replies.all().order_by('created_at'), 
                many=True, 
                context=self.context
            ).data
        return []




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
