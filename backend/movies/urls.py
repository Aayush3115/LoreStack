from django.urls import path
from .views import (
    trending_movies, trending_tv, trending_anime, 
    movie_details, tv_details, 
    movie_rating, tv_rating, anime_rating,
    universal_search, 
    movie_activity, tv_activity, anime_activity,
    user_watchlist, 
    movie_recommendations, tv_recommendations,
    anime_details
)

urlpatterns = [
    path("trending-movies/", trending_movies, name="trending_movies"),
    path("trending-tv/", trending_tv, name="trending_tv"),
    path("trending-anime/", trending_anime, name="trending_anime"),
    path("search/", universal_search, name="universal_search"),
    path("user-watchlist/", user_watchlist, name="user_watchlist"),
    path("<int:movie_id>/", movie_details, name="movie_details"),
    path("tv/<int:tv_id>/", tv_details, name="tv_details"),
    path("anime/<int:anime_id>/", anime_details, name="anime_details"),
    path("<int:movie_id>/rating/", movie_rating, name="movie_rating"),
    path("tv/<int:tv_id>/rating/", tv_rating, name="tv_rating"),
    path("anime/<int:anime_id>/rating/", anime_rating, name="anime_rating"),
    path("<int:movie_id>/activity/", movie_activity, name="movie_activity"),
    path("tv/<int:tv_id>/activity/", tv_activity, name="tv_activity"),
    path("anime/<int:anime_id>/activity/", anime_activity, name="anime_activity"),
    path("<int:movie_id>/recommendations/", movie_recommendations, name="movie_recommendations"),
    path("tv/<int:tv_id>/recommendations/", tv_recommendations, name="tv_recommendations"),
]
