from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Community
from .serializers import CommunitySerializer
from rest_framework_simplejwt.authentication import JWTAuthentication

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
        serializer.save(created_by=self.request.user)

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

