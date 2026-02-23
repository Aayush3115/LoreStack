from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings 
from rest_framework.response import Response
import requests
from rest_framework import status
from .models import MovieRating
from .serializers import MovieRatingSerializer


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
    
@api_view(["GET"])
@permission_classes([AllowAny])
def movie_details(request,movie_id):
    try:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}"
        params = {
            "api_key": settings.TMDB_API_KEY,
            "append_to_response": "credits"
        }

        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        return Response({
            "status_code": response.status_code,
            "data": response.json()
        })
    except requests.exceptions.RequestException as e:
        return Response({"error": "Failed to fetch movie details"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def movie_rating(request, movie_id):
    if request.method == "GET":
        all_reviews = request.query_params.get("all", "false").lower() == "true"
        
        if all_reviews:
            ratings = MovieRating.objects.filter(movie_id=movie_id).select_related('user').order_by('-updated_at')
            serializer = MovieRatingSerializer(ratings, many=True)
            return Response(serializer.data)
            
        try:
            rating = MovieRating.objects.get(user=request.user, movie_id=movie_id)
            serializer = MovieRatingSerializer(rating)
            return Response(serializer.data)
        except MovieRating.DoesNotExist:
            return Response({"rating": None}, status=status.HTTP_200_OK)

    elif request.method == "POST":
        rating_val = request.data.get("rating")
        review_val = request.data.get("review", "")
        if not rating_val:
            return Response({"error": "Rating is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        rating, created = MovieRating.objects.update_or_create(
            user=request.user,
            movie_id=movie_id,
            defaults={
                "rating": rating_val,
                "review": review_val
            }
        )
        serializer = MovieRatingSerializer(rating)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        