from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Comment, Vote
from .serializers import CommentSerializer, VoteSerializer


class CommentViewSet(ModelViewSet):
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class VoteViewSet(ModelViewSet):
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        post = serializer.validated_data.get('post')
        vote_type = serializer.validated_data.get('vote_type')
        
        # Check if already exists
        existing_vote = Vote.objects.filter(user=user, post=post).first()
        if existing_vote:
            if existing_vote.vote_type == vote_type:
                # Remove vote if same one (undo)
                existing_vote.delete()
                return Response({'status': 'vote removed'}, status=status.HTTP_200_OK)
            else:
                # Update vote type (up -> down or vice versa)
                existing_vote.vote_type = vote_type
                existing_vote.save()
                return Response({'status': 'vote updated', 'vote_type': vote_type}, status=status.HTTP_200_OK)
        
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)