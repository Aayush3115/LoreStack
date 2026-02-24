from django.urls import path
from .views import trending, movie_details, movie_rating, search_movies, movie_activity

urlpatterns = [
    path("trending/", trending, name="trending"),
    path("search/", search_movies, name="search_movies"),
    path("<int:movie_id>/", movie_details, name="movie_details"),
    path("<int:movie_id>/rating/", movie_rating, name="movie_rating"),
    path("<int:movie_id>/activity/", movie_activity, name="movie_activity"),
]
