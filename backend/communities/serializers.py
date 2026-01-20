from rest_framework import serializers
from .models import Community

class CommunitySerializer(serializers.ModelSerializer):
    created_by_username = serializers.ReadOnlyField(
        source='created_by.username'
    )

    class Meta:
        model = Community
        fields = [
            'id',
            'name',
            'description',
            'created_by',
            'created_by_username',
            'members',
            'created_at'
        ]
        read_only_fields = ['created_by']
