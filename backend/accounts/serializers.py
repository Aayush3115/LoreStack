from rest_framework import serializers
from .models import User
from moods.models import Mood

class UserSerializer(serializers.ModelSerializer):
    preferred_moods = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Mood.objects.all(),
        required=False
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'bio',
            'avatar',
            'preferred_moods'
        ]
