from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Community, CommunityRequest
from .serializers import CommunitySerializer, CommunityRequestSerializer
from posts.models import Post
from posts.serializers import PostSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import PermissionDenied

class CommunityViewSet(ModelViewSet):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only the project creator can create communities.")
        serializer.save(created_by=self.request.user)

class CommunityRequestViewSet(ModelViewSet):
    queryset = CommunityRequest.objects.all()
    serializer_class = CommunityRequestSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    def get_queryset(self):
        if self.request.user.is_staff:
            return CommunityRequest.objects.all()
        return CommunityRequest.objects.filter(requested_by=self.request.user)

    @action(detail=True, methods=['get', 'post'])
    def posts(self, request, pk=None):
        community = self.get_object()
        
        if request.method == 'GET':
            posts = Post.objects.filter(community=community).order_by('-created_at')
            serializer = PostSerializer(posts, many=True, context={'request': request})
            return Response(serializer.data)
            
        elif request.method == 'POST':
            if not community.members.filter(id=request.user.id).exists():
                return Response({'error': 'You must be a member to post in this community.'}, status=403)
                
            serializer = PostSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(author=request.user, community=community)
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        community = self.get_object()
        community.members.add(request.user)
        return Response({'status': 'joined'})

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        community = self.get_object()
        community.members.remove(request.user)
        return Response({'status': 'left'})

