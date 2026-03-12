from rest_framework import serializers
from .models import MovieRating, MovieActivity, TVRating, TVActivity, AnimeRating, AnimeActivity

class MovieRatingSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = MovieRating
        fields = ['id', 'user', 'username', 'profile_picture', 'movie_id', 'rating', 'review', 'created_at', 'updated_at']
        read_only_fields = ['user', 'username', 'profile_picture']

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.user.profile_picture:
            try:
                url = obj.user.profile_picture.url
            except ValueError:
                url = '/media/profile_pics/default.jpg'
                
            if request:
                return request.build_absolute_uri(url)
            return url
            
        default_url = '/media/profile_pics/default.jpg'
        if request:
            return request.build_absolute_uri(default_url)
        return default_url

class MovieActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = MovieActivity
        fields = ['id', 'user', 'movie_id', 'is_watchlist', 'is_logged', 'created_at', 'updated_at']
        read_only_fields = ['user']

class TVRatingSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = TVRating
        fields = ['id', 'user', 'username', 'profile_picture', 'tv_id', 'rating', 'review', 'created_at', 'updated_at']
        read_only_fields = ['user', 'username', 'profile_picture']

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.user.profile_picture:
            try:
                url = obj.user.profile_picture.url
            except ValueError:
                url = '/media/profile_pics/default.jpg'
                
            if request:
                return request.build_absolute_uri(url)
            return url
            
        default_url = '/media/profile_pics/default.jpg'
        if request:
            return request.build_absolute_uri(default_url)
        return default_url

class TVActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = TVActivity
        fields = ['id', 'user', 'tv_id', 'is_watchlist', 'is_logged', 'created_at', 'updated_at']
        read_only_fields = ['user']

class AnimeRatingSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = AnimeRating
        fields = ['id', 'user', 'username', 'profile_picture', 'anime_id', 'rating', 'review', 'created_at', 'updated_at']
        read_only_fields = ['user', 'username', 'profile_picture']

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.user.profile_picture:
            try:
                url = obj.user.profile_picture.url
            except ValueError:
                url = '/media/profile_pics/default.jpg'
                
            if request:
                return request.build_absolute_uri(url)
            return url
            
        default_url = '/media/profile_pics/default.jpg'
        if request:
            return request.build_absolute_uri(default_url)
        return default_url

class AnimeActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimeActivity
        fields = ['id', 'user', 'anime_id', 'is_watchlist', 'is_logged', 'created_at', 'updated_at']
        read_only_fields = ['user']
