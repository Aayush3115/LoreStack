from rest_framework import serializers
from .models import MovieRating, MovieActivity, TVRating, TVActivity, AnimeRating, AnimeActivity, UserFavorite

class UserFavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFavorite
        fields = ['id', 'user', 'media_id', 'media_type', 'title', 'poster_path', 'created_at']
        read_only_fields = ['user']

class MovieRatingSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = MovieRating
        fields = ['id', 'user', 'username', 'profile_picture', 'movie_id', 'rating', 'review', 'created_at', 'updated_at']
        read_only_fields = ['user', 'username', 'profile_picture']

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        default_url = '/media/profile_pics/default.jpg'
        
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
        default_url = '/media/profile_pics/default.jpg'
        
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
        default_url = '/media/profile_pics/default.jpg'
        
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
            return request.build_absolute_uri(default_url)
        return default_url

class AnimeActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimeActivity
        fields = ['id', 'user', 'anime_id', 'is_watchlist', 'is_logged', 'created_at', 'updated_at']
        read_only_fields = ['user']
