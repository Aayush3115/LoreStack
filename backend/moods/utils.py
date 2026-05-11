from .models import Mood, MediaMood

class MoodClassifier:

    # TMDB Genre Mappings (IDs found in TMDB Documentation)
    GENRE_MAP = {
        'Dark': [27, 53, 80],                      # Horror, Thriller, Crime
        'Light': [16, 10751, 12, 10762],           # Animation, Family, Adventure, Kids
        'Comedic': [35],                          # Comedy
        'Emotional': [18, 10749, 10759],           # Drama, Romance, Action-Adventure
        'Intense': [28, 14, 878]                    # Action, Fantasy, Sci-Fi
    }

    # Common Keywords that trigger a specific mood
    KEYWORD_MAP = {
        'Dark': ['gritty', 'murder', 'serial killer', 'dark atmosphere', 'mystery', 'survival'],
        'Light': ['wholesome', 'uplifting', 'feel-good', 'cheerful', 'colorful'],
        'Emotional': ['sad', 'teary', 'heartbreaking', 'tragedy', 'melancholy', 'coming of age'],
        'Comedic': ['funny', 'humorous', 'parody', 'slapstick', 'satirical'],
        'Intense': ['explosive', 'fast-paced', 'adrenaline', 'distopian', 'war']
    }

    @classmethod
    def classify_tmdb(cls, media_id, media_type, genre_ids, overview=""):
        """
        Takes genre IDs and optional overview text from TMDB and returns 
        the top 1 or 2 matching moods.
        """
        scores = {mood: 0 for mood in cls.GENRE_MAP.keys()}

        # 1. Score by Genres (weighted high)
        for mood, ids in cls.GENRE_MAP.items():
            for gid in genre_ids:
                if gid in ids:
                    scores[mood] += 3

        # 2. Score by keywords in Overview (simple string matches)
        text = overview.lower()
        for mood, keywords in cls.KEYWORD_MAP.items():
            for kw in keywords:
                if kw in text:
                    scores[mood] += 1

        # 3. Sort by score
        sorted_moods = sorted(
            [mood for mood, score in scores.items() if score > 0],
            key=lambda x: scores[x],
            reverse=True
        )

        return sorted_moods[:1] # Return only the primary mood to ensure unique recommendations per vibe

    @classmethod
    def get_or_classify(cls, media_id, media_type, **kwargs):
        """
        Checks if a MediaMood mapping exists; if not, classifies and saves it.
        """
        try:
            return MediaMood.objects.get(media_id=media_id, media_type=media_type)
        except MediaMood.DoesNotExist:
            genre_ids = kwargs.get('genre_ids', [])
            overview = kwargs.get('overview', "")
            
            # For Anime (AniList), map genres explicitly if possible
            if media_type == 'anime':
                # Map string genres to mood categories
                found_moods = cls.classify_anime(kwargs.get('genres', []))
            else:
                found_moods = cls.classify_tmdb(media_id, media_type, genre_ids, overview)

            if not found_moods:
                # Fallback if no specific mood identified
                return None

            media_mood = MediaMood.objects.create(media_id=media_id, media_type=media_type)
            for m_name in found_moods:
                mood_obj, _ = Mood.objects.get_or_create(name=m_name)
                media_mood.moods.add(mood_obj)
            
            return media_mood

    @classmethod
    def classify_anime(cls, genre_list):
        """Helper to map AniList's string-based genres."""
        scores = {mood: 0 for mood in cls.GENRE_MAP.keys()}
        
        mapping = {
            'Action': 'Intense',
            'Adventure': 'Light',
            'Comedy': 'Comedic',
            'Drama': 'Emotional',
            'Horror': 'Dark',
            'Psychological': 'Dark',
            'Romance': 'Emotional',
            'Slice of Life': 'Light',
            'Thriller': 'Dark'
        }

        for genre in genre_list:
            if genre in mapping:
                scores[mapping[genre]] += 3
        
        return sorted([m for m, s in scores.items() if s > 0], key=lambda x: scores[x], reverse=True)[:1]
