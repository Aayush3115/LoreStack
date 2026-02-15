from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='author.username')
    user_id = serializers.ReadOnlyField(source='author.id')
    user_avatar = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    user_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id',
            'author',
            'username',
            'user_id',
            'user_avatar',
            'community',
            'title',
            'content',
            'likes',
            'comments_count',
            'user_liked',
            'created_at'
        ]
        read_only_fields = ['author', 'user_liked']

    def get_user_avatar(self, obj):
        request = self.context.get('request')
        if hasattr(obj.author, 'profile_picture') and obj.author.profile_picture:
            url = obj.author.profile_picture.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_likes(self, obj):
        return obj.like_set.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_user_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from interactions.models import Like
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False
