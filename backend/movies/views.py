from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings 
from rest_framework.response import Response
import requests
from rest_framework import status
from .models import MovieRating, MovieActivity, TVRating, TVActivity, AnimeRating, AnimeActivity
from .serializers import (
    MovieRatingSerializer, MovieActivitySerializer, 
    TVRatingSerializer, TVActivitySerializer,
    AnimeRatingSerializer, AnimeActivitySerializer
)



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
            serializer = MovieRatingSerializer(ratings, many=True, context={'request': request})
            return Response(serializer.data)
            
        try:
            rating = MovieRating.objects.get(user=request.user, movie_id=movie_id)
            serializer = MovieRatingSerializer(rating, context={'request': request})
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

        serializer = MovieRatingSerializer(rating, context={'request': request})
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
@permission_classes([AllowAny])
def user_stats(request, username=None):
    try:
        if username:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            if not request.user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            user = request.user

        movie_logs = MovieActivity.objects.filter(user=user, is_logged=True).count()
        tv_logs = TVActivity.objects.filter(user=user, is_logged=True).count()
        anime_logs = AnimeActivity.objects.filter(user=user, is_logged=True).count()
        
        movie_perfections = MovieRating.objects.filter(user=user, rating='perfection').count()
        tv_perfections = TVRating.objects.filter(user=user, rating='perfection').count()
        anime_perfections = AnimeRating.objects.filter(user=user, rating='perfection').count()
        
        joined_rooms = user.communities.count()
        
        return Response({
            "status_code": 200,
            "data": {
                "counts": {
                    "movies": movie_logs,
                    "tv": tv_logs,
                    "anime": anime_logs,
                    "total_logged": movie_logs + tv_logs + anime_logs,
                    "perfections": movie_perfections + tv_perfections + anime_perfections,
                    "rooms": joined_rooms
                }
            }
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([AllowAny])
def user_activity_list(request, username=None):
    try:
        if username:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            if not request.user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            user = request.user

        movie_activities = MovieActivity.objects.filter(user=user, is_logged=True).order_by('-updated_at')[:10]
        tv_activities = TVActivity.objects.filter(user=user, is_logged=True).order_by('-updated_at')[:10]
        anime_activities = AnimeActivity.objects.filter(user=user, is_logged=True).order_by('-updated_at')[:10]

        activities = []

        for act in movie_activities:
            rating_obj = MovieRating.objects.filter(user=user, movie_id=act.movie_id).first()
            activities.append({
                "id": act.movie_id,
                "media_type": "movie",
                "timestamp": act.updated_at,
                "rating": rating_obj.rating if rating_obj else None
            })

        for act in tv_activities:
            rating_obj = TVRating.objects.filter(user=user, tv_id=act.tv_id).first()
            activities.append({
                "id": act.tv_id,
                "media_type": "tv",
                "timestamp": act.updated_at,
                "rating": rating_obj.rating if rating_obj else None
            })

        for act in anime_activities:
            rating_obj = AnimeRating.objects.filter(user=user, anime_id=act.anime_id).first()
            activities.append({
                "id": act.anime_id,
                "media_type": "anime",
                "timestamp": act.updated_at,
                "rating": rating_obj.rating if rating_obj else None
            })

        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return Response({
            "status_code": 200,
            "data": activities[:8]
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([AllowAny])
def user_watchlist(request, username=None):
    try:
        if username:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            if not request.user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            user = request.user

        movie_activities = MovieActivity.objects.filter(user=user, is_watchlist=True).order_by("-updated_at")
        tv_activities = TVActivity.objects.filter(user=user, is_watchlist=True).order_by("-updated_at")
        anime_activities = AnimeActivity.objects.filter(user=user, is_watchlist=True).order_by("-updated_at")
        
        results = []
        for activity in movie_activities:
            results.append({
                "id": activity.movie_id,
                "media_type": "movie",
                "updated_at": activity.updated_at
            })
        for activity in tv_activities:
            results.append({
                "id": activity.tv_id,
                "media_type": "tv",
                "updated_at": activity.updated_at
            })
        for activity in anime_activities:
            results.append({
                "id": activity.anime_id,
                "media_type": "anime",
                "updated_at": activity.updated_at
            })
            
        results.sort(key=lambda x: x["updated_at"], reverse=True)
        
        return Response({
            "status_code": 200,
            "data": results
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

@api_view(["GET"])
@permission_classes([AllowAny])
def anime_details(request, anime_id):
    query = '''
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
        }
        bannerImage
        description
        format
        status
        episodes
        duration
        genres
        averageScore
        popularity
        season
        seasonYear
        studios(isMain: true) {
          nodes {
            name
          }
        }
        characters(sort: ROLE, perPage: 12) {
          edges {
            role
            node {
              id
              name {
                full
              }
              image {
                large
              }
            }
            voiceActors(language: JAPANESE) {
              name {
                full
              }
              image {
                large
              }
            }
          }
        }
        relations {
          edges {
            relationType
            node {
              id
              title {
                romaji
                english
              }
              type
              coverImage {
                large
              }
            }
          }
        }
        recommendations(sort: RATING_DESC, perPage: 10) {
          nodes {
            mediaRecommendation {
              id
              title {
                romaji
                english
              }
              coverImage {
                large
              }
              type
              averageScore
            }
          }
        }
      }
    }
    '''
    try:
        url = 'https://graphql.anilist.co'
        response = requests.post(url, json={'query': query, 'variables': {'id': anime_id}}, timeout=10)
        response.raise_for_status()
        
        return Response({
            "status_code": 200,
            "data": response.json().get('data', {}).get('Media', {})
        })
    except requests.exceptions.RequestException as e:
        return Response({
            "error": "Failed to fetch anime details",
            "details": str(e)
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def anime_rating(request, anime_id):
    if request.method == "GET":
        all_reviews = request.query_params.get("all", "false").lower() == "true"
        if all_reviews:
            ratings = AnimeRating.objects.filter(anime_id=anime_id).order_by("-updated_at")
            serializer = AnimeRatingSerializer(ratings, many=True, context={"request": request})
            return Response(serializer.data)
        
        try:
            rating = AnimeRating.objects.get(user=request.user, anime_id=anime_id)
            serializer = AnimeRatingSerializer(rating, context={"request": request})
            return Response(serializer.data)
        except AnimeRating.DoesNotExist:
            return Response({"rating": None, "review": ""})

    elif request.method == "POST":
        rating_val = request.data.get("rating")
        review_val = request.data.get("review")
        
        rating_obj, created = AnimeRating.objects.update_or_create(
            user=request.user,
            anime_id=anime_id,
            defaults={"rating": rating_val, "review": review_val}
        )
        
        # Auto-log when rated
        AnimeActivity.objects.update_or_create(
            user=request.user,
            anime_id=anime_id,
            defaults={"is_logged": True}
        )
        
        serializer = AnimeRatingSerializer(rating_obj, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    elif request.method == "DELETE":
        try:
            rating = AnimeRating.objects.get(user=request.user, anime_id=anime_id)
            rating.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except AnimeRating.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def anime_activity(request, anime_id):
    if request.method == "GET":
        try:
            activity = AnimeActivity.objects.get(user=request.user, anime_id=anime_id)
            serializer = AnimeActivitySerializer(activity)
            return Response(serializer.data)
        except AnimeActivity.DoesNotExist:
            return Response({"is_watchlist": False, "is_logged": False}, status=status.HTTP_200_OK)

    elif request.method == "POST":
        is_watchlist = request.data.get("is_watchlist")
        is_logged = request.data.get("is_logged")
        
        defaults = {}
        if is_watchlist is not None:
            defaults["is_watchlist"] = is_watchlist
        if is_logged is not None:
            defaults["is_logged"] = is_logged
            
        activity, created = AnimeActivity.objects.update_or_create(
            user=request.user,
            anime_id=anime_id,
            defaults=defaults
        )
        serializer = AnimeActivitySerializer(activity)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def tv_rating(request, tv_id):
    if request.method == "GET":
        all_reviews = request.query_params.get("all", "false").lower() == "true"
        if all_reviews:
            ratings = TVRating.objects.filter(tv_id=tv_id).select_related('user').order_by('-updated_at')
            serializer = TVRatingSerializer(ratings, many=True, context={'request': request})
            return Response(serializer.data)
        try:
            rating = TVRating.objects.get(user=request.user, tv_id=tv_id)
            serializer = TVRatingSerializer(rating, context={'request': request})
            return Response(serializer.data)
        except TVRating.DoesNotExist:
            return Response({"rating": None}, status=status.HTTP_200_OK)
    elif request.method == "POST":
        rating_val = request.data.get("rating")
        review_val = request.data.get("review", "")
        if not rating_val:
            return Response({"error": "Rating is required"}, status=status.HTTP_400_BAD_REQUEST)
        rating, created = TVRating.objects.update_or_create(
            user=request.user,
            tv_id=tv_id,
            defaults={"rating": rating_val, "review": review_val}
        )
        TVActivity.objects.update_or_create(
            user=request.user,
            tv_id=tv_id,
            defaults={"is_logged": True}
        )
        serializer = TVRatingSerializer(rating, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    elif request.method == "DELETE":
        try:
            rating = TVRating.objects.get(user=request.user, tv_id=tv_id)
            rating.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TVRating.DoesNotExist:
            return Response({"error": "Rating not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def tv_activity(request, tv_id):
    if request.method == "GET":
        try:
            activity = TVActivity.objects.get(user=request.user, tv_id=tv_id)
            serializer = TVActivitySerializer(activity)
            return Response(serializer.data)
        except TVActivity.DoesNotExist:
            return Response({"is_watchlist": False, "is_logged": False}, status=status.HTTP_200_OK)
    elif request.method == "POST":
        is_watchlist = request.data.get("is_watchlist")
        is_logged = request.data.get("is_logged")
        defaults = {}
        if is_watchlist is not None:
            defaults["is_watchlist"] = is_watchlist
        if is_logged is not None:
            defaults["is_logged"] = is_logged
        activity, created = TVActivity.objects.update_or_create(
            user=request.user,
            tv_id=tv_id,
            defaults=defaults
        )
        serializer = TVActivitySerializer(activity)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([AllowAny])
def tv_recommendations(request, tv_id):
    api_key = settings.TMDB_API_KEY
    try:
        detail_res = requests.get(
            f"https://api.themoviedb.org/3/tv/{tv_id}",
            params={"api_key": api_key, "append_to_response": "credits,keywords"},
            timeout=8
        )
        detail_res.raise_for_status()
        tv_show = detail_res.json()
        genre_ids = [g["id"] for g in tv_show.get("genres", [])]
        keywords = tv_show.get("keywords", {}).get("results", [])
        keyword_ids = [k["id"] for k in keywords][:5]
        top_cast_ids = [p["id"] for p in tv_show.get("credits", {}).get("cast", [])[:3]]
        seen_ids = {tv_id}
        recommendations = []
        def discover(params, limit=6):
            base = {
                "api_key": api_key,
                "language": "en-US",
                "sort_by": "vote_average.desc",
                "vote_count.gte": 50,
                "include_adult": False,
                "page": 1,
            }
            base.update(params)
            r = requests.get("https://api.themoviedb.org/3/discover/tv", params=base, timeout=8)
            if r.ok:
                results = r.json().get("results", [])
                for res in results:
                    res["title"] = res.get("name")
                return results[:limit]
            return []
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
        recommendations.sort(key=lambda x: x.get("vote_average", 0), reverse=True)
        return Response({"status_code": 200, "data": recommendations[:18]})
    except Exception as e:
        return Response({"error": "An unexpected error occurred", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

import math

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def collaborative_recommendations(request):
    """
    User-User Collaborative Filtering using Cosine Similarity.
    1. Maps string ratings to numerical values.
    2. Calculates similarity between current user and all other users.
    3. Identifies movies liked by similar users but not seen by the current user.
    """
    RATING_WEIGHTS = {
        'perfection': 5.0,
        'goforit': 4.0,
        'timepass': 2.0,
        'skip': 1.0,
    }

    current_user = request.user
    
    # 1. Fetch current user's ratings
    my_ratings = MovieRating.objects.filter(user=current_user)
    if not my_ratings.exists():
        return Response({
            "status_code": 200, 
            "data": [], 
            "message": "Rate some movies to get personalized recommendations!"
        })

    my_vector = {r.movie_id: RATING_WEIGHTS.get(r.rating, 0) for r in my_ratings}
    my_movie_ids = set(my_vector.keys())

    # 2. Fetch all other users' ratings
    other_ratings_objs = MovieRating.objects.exclude(user=current_user)
    
    # Group ratings by user
    user_vectors = {}
    for r in other_ratings_objs:
        if r.user_id not in user_vectors:
            user_vectors[r.user_id] = {}
        user_vectors[r.user_id][r.movie_id] = RATING_WEIGHTS.get(r.rating, 0)

    # 3. Calculate Cosine Similarity for each user
    similarities = []
    
    def get_cosine_sim(v1, v2):
        common_movies = set(v1.keys()) & set(v2.keys())
        if not common_movies:
            return 0.0
        
        dot_product = sum(v1[m] * v2[m] for m in common_movies)
        mag1 = math.sqrt(sum(val**2 for val in v1.values()))
        mag2 = math.sqrt(sum(val**2 for val in v2.values()))
        
        if mag1 == 0 or mag2 == 0:
            return 0.0
        return dot_product / (mag1 * mag2)

    for other_user_id, other_vector in user_vectors.items():
        sim = get_cosine_sim(my_vector, other_vector)
        if sim > 0.1: 
            similarities.append((other_user_id, sim))

    # Sort users by similarity (descending)
    similarities.sort(key=lambda x: x[1], reverse=True)
    top_neighbors = similarities[:10] 

    if not top_neighbors:
        return Response({"status_code": 200, "data": []})

    # 4. Aggregate recommendations from neighbors
    recommendation_scores = {} 
    
    for neighbor_id, sim in top_neighbors:
        neighbor_vec = user_vectors[neighbor_id]
        for movie_id, rating in neighbor_vec.items():
            if movie_id not in my_movie_ids:
                if rating >= 4:
                    if movie_id not in recommendation_scores:
                        recommendation_scores[movie_id] = 0
                    recommendation_scores[movie_id] += sim * rating

    # 5. Sort recommendations and fetch details from TMDB
    sorted_recs = sorted(recommendation_scores.items(), key=lambda x: x[1], reverse=True)[:10]
    
    final_movies = []
    api_key = settings.TMDB_API_KEY
    
    for movie_id, score in sorted_recs:
        try:
            res = requests.get(
                f"https://api.themoviedb.org/3/movie/{movie_id}",
                params={"api_key": api_key},
                timeout=5
            )
            if res.ok:
                m_data = res.json()
                # Store the similarity weight
                m_data["match_score"] = round(score, 1)
                m_data["recommendation_type"] = "collaborative"
                final_movies.append(m_data)
        except:
            continue

    return Response({
        "status_code": 200,
        "data": final_movies
    })