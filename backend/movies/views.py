from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings 
from rest_framework.response import Response
import requests
from rest_framework import status
from .models import MovieRating, MovieActivity
from .serializers import MovieRatingSerializer, MovieActivitySerializer



@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def movie_activity(request, movie_id):
    if request.method == "GET":
        try:
            activity = MovieActivity.objects.get(user=request.user, movie_id=movie_id)
            serializer = MovieActivitySerializer(activity)
            return Response(serializer.data)
        except MovieActivity.DoesNotExist:
            return Response({"is_watchlist": False, "is_logged": False}, status=status.HTTP_200_OK)

    elif request.method == "POST":
        is_watchlist = request.data.get("is_watchlist")
        is_logged = request.data.get("is_logged")
        
        defaults = {}
        if is_watchlist is not None:
            defaults["is_watchlist"] = is_watchlist
        if is_logged is not None:
            defaults["is_logged"] = is_logged
            
        activity, created = MovieActivity.objects.update_or_create(
            user=request.user,
            movie_id=movie_id,
            defaults=defaults
        )
        serializer = MovieActivitySerializer(activity)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


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
    except requests.exceptions.HTTPError as e:
        return Response({"error": "TMDB service error", "details": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
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
            "append_to_response": "credits,release_dates"
        }

        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        return Response({
            "status_code": response.status_code,
            "data": response.json()
        })
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            return Response({"error": "Movie not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"error": "External service error"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except requests.exceptions.RequestException as e:
        return Response({"error": "Failed to fetch movie details"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        return Response({"error": "An internal error occurred", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET", "POST", "DELETE"])
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

        MovieActivity.objects.update_or_create(
            user=request.user,
            movie_id=movie_id,
            defaults={"is_logged": True}
        )

        serializer = MovieRatingSerializer(rating)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    elif request.method == "DELETE":
        try:
            rating = MovieRating.objects.get(user=request.user, movie_id=movie_id)
            rating.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except MovieRating.DoesNotExist:
            return Response({"error": "Rating not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(["GET"])
@permission_classes([AllowAny])
def search_movies(request):
    query = request.query_params.get("query")
    if not query:
        return Response({"error": "Query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        url = "https://api.themoviedb.org/3/search/movie"
        params = {
            "api_key": settings.TMDB_API_KEY,
            "query": query
        }
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        
        return Response({
            "status_code": response.status_code,
            "data": response.json()
        })
    except requests.exceptions.RequestException as e:
        return Response({"error": "Failed to search movies"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        