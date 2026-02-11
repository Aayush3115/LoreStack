from rest_framework import serializers
from .models import Community

class CommunitySerializer(serializers.ModelSerializer):
    created_by_username = serializers.ReadOnlyField(
        source='created_by.username'
    )
    members = serializers.SerializerMethodField()
    member_ids = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True, source='members'
    )
    memberCount = serializers.SerializerMethodField()
    joined = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = [
            'id',
            'name',
            'description',
            'avatar_icon',
            'created_by',
            'created_by_username',
            'members',
            'member_ids',
            'memberCount',
            'joined',
            'created_at'
        ]
        read_only_fields = ['created_by']

    def get_members(self, obj):
        count = obj.members.count()
        if count >= 1000:
            return f"{count/1000:.1f}k"
        return str(count)


    def get_memberCount(self, obj):
        return obj.members.count()

    def get_joined(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False


