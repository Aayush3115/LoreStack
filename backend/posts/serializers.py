from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='author.username')
    user_id = serializers.ReadOnlyField(source='author.id')
    community_name = serializers.ReadOnlyField(source='community.name')
    user_avatar = serializers.SerializerMethodField()
    vote_score = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id',
            'author',
            'username',
            'user_id',
            'user_avatar',
            'community',
            'community_name',
            'title',
            'content',
            'vote_score',
            'comments_count',
            'user_vote',
            'created_at'
        ]
        read_only_fields = ['author', 'user_vote']

    def get_user_avatar(self, obj):
        request = self.context.get('request')
        default_path = '/media/profile_pics/default.jpg'
        
        if obj.author.profile_picture:
            try:
                url = obj.author.profile_picture.url
                if url and 'default.jpg' not in url:
                    if request:
                        return request.build_absolute_uri(url)
                    return url
            except Exception:
                pass
                
        # Fallback to local default image
        if request:
            return request.build_absolute_uri(default_path)
        return default_path

    def get_vote_score(self, obj):
        from django.db.models import Sum
        score = obj.votes.aggregate(Sum('vote_type'))['vote_type__sum']
        return score if score is not None else 0

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from interactions.models import Vote
            vote = Vote.objects.filter(user=request.user, post=obj).first()
            return vote.vote_type if vote else 0
        return 0
