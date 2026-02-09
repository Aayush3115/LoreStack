from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings 
from rest_framework.response import Response
import requests


@api_view(["GET"])
@permission_classes([AllowAny])
def trending(request):
    try:
        url = "https://api.themoviedb.org/3/trending/movie/day"
        params = {
            "api_key": settings.TMDB_API_KEY
        }
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        
        return Response({
            "status_code": response.status_code,
            "data": response.json()
        })
    except requests.exceptions.RequestException as e:
        return Response({
            "error": "Failed to fetch trending movies",
            "details": str(e)
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        return Response({
            "error": "An unexpected error occurred",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)