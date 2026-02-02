from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings 
from rest_framework.response import Response
import requests


@api_view(["GET"])
@permission_classes([AllowAny])
def trending(request):
    url = "https://api.themoviedb.org/3/trending/movie/day"
    params = {
        "api_key": settings.TMDB_API_KEY
    }
    response = requests.get(url, params=params)

    return Response({
        "status_code": response.status_code,
        "data": response.json()
    })