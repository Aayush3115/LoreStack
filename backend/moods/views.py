from django.shortcuts import render
from rest_framework.viewsets import ReadOnlyModelViewSet
from .models import Mood
from .serializers import MoodSerializer

# Create your views here.


class MoodViewSet(ReadOnlyModelViewSet):
    queryset = Mood.objects.all()
    serializer_class = MoodSerializer
