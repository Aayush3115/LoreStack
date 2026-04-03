from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Post
from .serializers import PostSerializer
from communities.models import Community
from django.db.models import Sum, Value, Count
from django.db.models.functions import Coalesce

from rest_framework import permissions

class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user

class PostViewSet(ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def get_queryset(self):
        queryset = Post.objects.annotate(
            score=Coalesce(Sum('votes__vote_type'), Value(0)),
            comments_count_attr=Count('comments', distinct=True)
        )
        sort = self.request.query_params.get('sort', 'latest')
        
        if sort == 'popular':
            return queryset.order_by('-score', '-created_at')
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def joined_posts(self, request):
        joined_communities = Community.objects.filter(members=request.user)
        queryset = Post.objects.filter(community__in=joined_communities).annotate(
            score=Coalesce(Sum('votes__vote_type'), Value(0)),
            comments_count_attr=Count('comments', distinct=True)
        )
        
        sort = request.query_params.get('sort', 'latest')
        if sort == 'popular':
            posts = queryset.order_by('-score', '-created_at')
        else:
            posts = queryset.order_by('-created_at')
            
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

