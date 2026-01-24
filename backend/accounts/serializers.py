from rest_framework import serializers
from .models import User
from moods.models import Mood
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password


User = get_user_model()

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
            'preferred_moods',
            'first_name',
            'last_name',
        ]
        read_only_fields = ('id','preferred_moods')

class RegisterSerializer(serializers.ModelSerializer):
    password=serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2=serializers.CharField(write_only=True,required=True)

    class Meta:
        model=User
        fields = (
            'username', 
            'password', 
            'password2', 
            'email', 
            'first_name', 
            'last_name',
            'bio',
            'avatar'
        )
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'bio': {'required': False},
            'avatar': {'required': False}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'first_name', 
            'last_name',
            'email',
            'bio',
            'avatar'
        )