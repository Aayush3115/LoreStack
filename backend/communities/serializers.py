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
    activeMembers = serializers.SerializerMethodField()
    storiesCount = serializers.SerializerMethodField()
    memberPreview = serializers.SerializerMethodField()
    joined = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = [
            'id',
            'name',
            'description',
            'mood',
            'created_by',
            'created_by_username',
            'members',
            'member_ids',
            'activeMembers',
            'storiesCount',
            'memberPreview',
            'joined',
            'created_at'
        ]
        read_only_fields = ['created_by']

    def get_members(self, obj):
        count = obj.members.count()
        if count >= 1000:
            return f"{count/1000:.1f}k"
        return str(count)


    def get_activeMembers(self, obj):
        import random
        count = random.randint(1, 50)
        return f"{count} Active Now"

    def get_storiesCount(self, obj):
        import random
        count = random.randint(10, 500)
        return f"{count} Stories"

    def get_memberPreview(self, obj):
        count = obj.members.count()
        return max(0, count - 3)

    def get_joined(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False


