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
def trending_movies(request):
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
def trending_tv(request):
    try:
        url = "https://api.themoviedb.org/3/trending/tv/day"
        params = {
            "api_key": settings.TMDB_API_KEY
        }
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        if 'results' in data:
            data['results'] = [item for item in data['results'] if 16 not in item.get('genre_ids', [])]
        
        return Response({
            "status_code": response.status_code,
            "data": data
        })
    except requests.exceptions.HTTPError as e:
        return Response({"error": "TMDB service error", "details": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except requests.exceptions.RequestException as e:
        return Response({
            "error": "Failed to fetch trending webseries",
            "details": str(e)
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        return Response({
            "error": "An unexpected error occurred",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["GET"])
@permission_classes([AllowAny])
def trending_anime(request):
    query = '''
    query {
      Page(page: 1, perPage: 20) {
        media(type: ANIME, sort: TRENDING_DESC) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            extraLarge
          }
          bannerImage
          description
          format
        }
      }
    }
    '''
    try:
        url = 'https://graphql.anilist.co'
        response = requests.post(url, json={'query': query}, timeout=10)
        response.raise_for_status()
        
        return Response({
            "status_code": 200,
            "data": response.json().get('data', {}).get('Page', {}).get('media', [])
        })
    except requests.exceptions.RequestException as e:
        return Response({
            "error": "Failed to fetch trending anime",
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

@api_view(["GET"])
@permission_classes([AllowAny])
def tv_details(request, tv_id):
    try:
        url = f"https://api.themoviedb.org/3/tv/{tv_id}"
        params = {
            "api_key": settings.TMDB_API_KEY,
            "append_to_response": "credits,content_ratings"
        }

        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        return Response({
            "status_code": response.status_code,
            "data": response.json()
        })
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            return Response({"error": "TV show not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"error": "External service error"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except requests.exceptions.RequestException as e:
        return Response({"error": "Failed to fetch TV show details"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
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
def universal_search(request):
    query = request.query_params.get("query")
    if not query:
        return Response({"error": "Query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    results = {
        "movies": [],
        "tv": [],
        "anime": []
    }

    tmdb_params = {
        "api_key": settings.TMDB_API_KEY,
        "query": query,
        "language": "en-US",
        "page": 1,
        "include_adult": False
    }

    # Fetch TMDB Movies
    try:
        movie_response = requests.get("https://api.themoviedb.org/3/search/movie", params=tmdb_params, timeout=5)
        if movie_response.ok:
            results["movies"] = movie_response.json().get("results", [])[:5]
    except Exception as e:
        print(f"Movie search error: {e}")

    # Fetch TMDB TV
    try:
        tv_response = requests.get("https://api.themoviedb.org/3/search/tv", params=tmdb_params, timeout=5)
        if tv_response.ok:
            results["tv"] = tv_response.json().get("results", [])[:5]
    except Exception as e:
        print(f"TV search error: {e}")

    # Fetch AniList Anime
    anime_query = '''
    query ($search: String) {
      Page(page: 1, perPage: 5) {
        media(search: $search, type: ANIME) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          type
        }
      }
    }
    '''
    try:
        anime_response = requests.post(
            'https://graphql.anilist.co',
            json={'query': anime_query, 'variables': {'search': query}},
            timeout=5
        )
        if anime_response.ok:
            results["anime"] = anime_response.json().get('data', {}).get('Page', {}).get('media', [])
    except Exception as e:
        print(f"Anime search error: {e}")

    # Flatten results for frontend consumption
    # We tag them so the frontend knows how to render/handle them
    flattened_results = []
    
    for m in results["movies"]:
        m["media_type"] = "movie"
        flattened_results.append(m)
        
    for t in results["tv"]:
        t["media_type"] = "tv"
        # Map name to title for consistency if needed, though frontend handles both
        flattened_results.append(t)
        
    for a in results["anime"]:
        a["media_type"] = "anime"
        # Map AniList structure to something flatter for search consistency
        flattened_results.append({
            "id": a["id"],
            "title": a["title"]["english"] or a["title"]["romaji"],
            "poster_path": a["coverImage"]["large"],
            "release_date": "", # AniList has different date format, keeping it simple
            "media_type": "anime"
        })

    return Response({
        "status_code": 200,
        "data": {
            "results": flattened_results
        }
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_watchlist(request):
    try:
        activities = MovieActivity.objects.filter(user=request.user, is_watchlist=True).order_by("-updated_at")
        serializer = MovieActivitySerializer(activities, many=True)
        return Response({
            "status_code": 200,
            "data": serializer.data
        })
    except Exception as e:
        return Response({
            "error": "Failed to fetch watchlist",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def movie_recommendations(request, movie_id):
    """
    Content-based filtering: recommend movies similar to a given movie using
    genres, keywords, director, and top actors from TMDB.
    """
    api_key = settings.TMDB_API_KEY

    try:
        # 1. Fetch full movie details (includes credits)
        detail_res = requests.get(
            f"https://api.themoviedb.org/3/movie/{movie_id}",
            params={"api_key": api_key, "append_to_response": "credits,keywords"},
            timeout=8
        )
        detail_res.raise_for_status()
        movie = detail_res.json()

        # 2. Extract content-based signals
        genre_ids = [g["id"] for g in movie.get("genres", [])]
        keyword_ids = [k["id"] for k in movie.get("keywords", {}).get("keywords", [])][:5]

        # Director
        director = next(
            (p for p in movie.get("credits", {}).get("crew", []) if p.get("job") == "Director"),
            None
        )
        director_id = director["id"] if director else None

        # Top 3 actors
        top_cast_ids = [p["id"] for p in movie.get("credits", {}).get("cast", [])[:3]]

        seen_ids = {movie_id}
        recommendations = []

        def discover(params, limit=6):
            """Helper to call TMDB Discover and return results."""
            base = {
                "api_key": api_key,
                "language": "en-US",
                "sort_by": "vote_average.desc",
                "vote_count.gte": 50,
                "include_adult": False,
                "page": 1,
            }
            base.update(params)
            r = requests.get("https://api.themoviedb.org/3/discover/movie", params=base, timeout=8)
            if r.ok:
                return r.json().get("results", [])[:limit]
            return []

        # 3. Signal 1 — Director + Genre
        if director_id and genre_ids:
            results = discover({
                "with_crew": str(director_id),
                "with_genres": ",".join(str(g) for g in genre_ids[:2]),
            })
            for m in results:
                if m["id"] not in seen_ids:
                    m["match_reason"] = f"From director {director['name']}"
                    recommendations.append(m)
                    seen_ids.add(m["id"])

        # 4. Signal 2 — Keywords + Genre
        if keyword_ids and genre_ids:
            results = discover({
                "with_keywords": "|".join(str(k) for k in keyword_ids),
                "with_genres": ",".join(str(g) for g in genre_ids[:2]),
            })
            for m in results:
                if m["id"] not in seen_ids:
                    m["match_reason"] = "Similar themes & genre"
                    recommendations.append(m)
                    seen_ids.add(m["id"])

        # 5. Signal 3 — Top cast members
        if top_cast_ids:
            results = discover({
                "with_cast": ",".join(str(a) for a in top_cast_ids[:2]),
                "with_genres": ",".join(str(g) for g in genre_ids[:1]) if genre_ids else "",
            }, limit=8)
            for m in results:
                if m["id"] not in seen_ids:
                    m["match_reason"] = "Shared cast"
                    recommendations.append(m)
                    seen_ids.add(m["id"])

        # 6. Signal 4 — Genre-only fallback to ensure we always return something
        if len(recommendations) < 8 and genre_ids:
            results = discover({
                "with_genres": ",".join(str(g) for g in genre_ids[:2]),
                "sort_by": "popularity.desc",
            }, limit=12)
            for m in results:
                if m["id"] not in seen_ids and len(recommendations) < 18:
                    m["match_reason"] = "Same genre"
                    recommendations.append(m)
                    seen_ids.add(m["id"])

        # Sort by vote_average desc and cap at 18
        recommendations.sort(key=lambda x: x.get("vote_average", 0), reverse=True)
        final = recommendations[:18]

        return Response({"status_code": 200, "data": final})

    except requests.exceptions.RequestException as e:
        return Response({"error": "Failed to fetch recommendations", "details": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        return Response({"error": "An unexpected error occurred", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)