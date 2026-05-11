from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
import requests
from .models import Mood, MediaMood
from .serializers import MoodSerializer
from .utils import MoodClassifier
from movies.models import MovieRating, TVRating, AnimeRating

class MoodViewSet(ReadOnlyModelViewSet):
    queryset = Mood.objects.all()
    serializer_class = MoodSerializer

@api_view(["GET"])
@permission_classes([AllowAny])
def mood_recommendations(request):
    
    vibe_name = request.query_params.get("vibe")
    media_type = request.query_params.get("type", "movie")
    user = request.user if request.user.is_authenticated else None

    # Step 1: Profile-based scoring (only if user logged in)
    preferred_moods = set()
    behavior_moods = set()

    if user:
        preferred_moods = set(user.preferred_moods.values_list('name', flat=True))
        # Infer behavior moods from highly rated content ('perfection' or 'goforit')
        behavior_moods = get_behavioral_moods(user, media_type)

    # Step 2: Fetch Candidate Pool (Top Trending)
    # Since we want fresh and relevant results for 'Current Vibe'
    candidates = fetch_trending_from_api(media_type)
    
    scored_items = []

    for item in candidates:
        # Check if item matches current selected vibe or profile
        item_id = item.get('id')
        item_name = item.get('title') or item.get('name') or (item.get('title', {}).get('english') if isinstance(item.get('title'), dict) else "")
        overview = item.get('overview') or item.get('description', "")
        genre_ids = item.get('genre_ids', [])
        genres = item.get('genres', [])

        # Get or Classify Moods
        media_mood = MoodClassifier.get_or_classify(
            item_id, media_type, 
            genre_ids=genre_ids, 
            overview=overview,
            genres=genres
        )
        
        if not media_mood:
            continue

        # Only consider the PRIMARY mood to ensure a movie is unique to one vibe
        first_mood = media_mood.moods.first()
        item_mood_names = {first_mood.name} if first_mood else set()
        
        score = 0
        
        # Scoring logic from USER's Algorithm:
        # +2 if matches preferred
        # +1 if matches behavior
        # +5 if it matches the current CHOSEN vibe (to ensure the vibe picker works correctly)
        
        if vibe_name and vibe_name in item_mood_names:
            score += 5 

        for m in item_mood_names:
            if m in preferred_moods:
                score += 2
            elif m in behavior_moods:
                score += 1
        
        if score > 0:
            item['recommendation_score'] = score
            item['moods'] = list(item_mood_names)
            scored_items.append(item)

    # Step 3: Sort and Return
    scored_items.sort(key=lambda x: x.get('recommendation_score', 0), reverse=True)
    return Response({
        "status_code": 200,
        "data": scored_items[:12]
    })

def get_behavioral_moods(user, media_type):
    """Infers moods from highly rated items (Perfection/Go For It)."""
    mood_counts = {}
    
    if media_type == 'movie':
        ratings = MovieRating.objects.filter(user=user, rating__in=['perfection', 'goforit']).values_list('movie_id', flat=True)
    elif media_type == 'tv':
        ratings = TVRating.objects.filter(user=user, rating__in=['perfection', 'goforit']).values_list('tv_id', flat=True)
    else: # Anime
        ratings = AnimeRating.objects.filter(user=user, rating__in=['perfection', 'goforit']).values_list('anime_id', flat=True)

    mappings = MediaMood.objects.filter(media_id__in=list(ratings), media_type=media_type)
    for m in mappings:
        for mood in m.moods.all():
            mood_counts[mood.name] = mood_counts.get(mood.name, 0) + 1
    
    # Return top 2 moods as behavioral moods
    return sorted(mood_counts, key=mood_counts.get, reverse=True)[:2]

def fetch_trending_from_api(media_type):
    """Bridge to external APIs for trending candidate lists."""
    api_key = settings.TMDB_API_KEY
    try:
        if media_type == 'movie':
            url = f"https://api.themoviedb.org/3/trending/movie/day?api_key={api_key}"
            res = requests.get(url, timeout=5).json()
            return res.get('results', [])
        elif media_type == 'tv':
            url = f"https://api.themoviedb.org/3/trending/tv/day?api_key={api_key}"
            res = requests.get(url, timeout=5).json()
            return res.get('results', [])
        else: # Anime (AniList)
            query = '''query { Page(page: 1, perPage: 20) { media(type: ANIME, sort: TRENDING_DESC) { id title { english romaji } genres coverImage { large } description } } }'''
            res = requests.post('https://graphql.anilist.co', json={'query': query}, timeout=10).json()
            return res.get('data', {}).get('Page', {}).get('media', [])
    except Exception:
        return []
