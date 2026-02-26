from django.urls import path
from .views import trending_movies, trending_tv, trending_anime, movie_details, tv_details, movie_rating, universal_search, movie_activity

urlpatterns = [
    path("trending-movies/", trending_movies, name="trending_movies"),
    path("trending-tv/", trending_tv, name="trending_tv"),
    path("trending-anime/", trending_anime, name="trending_anime"),
    path("search/", universal_search, name="universal_search"),
    path("<int:movie_id>/", movie_details, name="movie_details"),
    path("tv/<int:tv_id>/", tv_details, name="tv_details"),
    path("<int:movie_id>/rating/", movie_rating, name="movie_rating"),
    path("<int:movie_id>/activity/", movie_activity, name="movie_activity"),
]
