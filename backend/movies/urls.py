from django.urls import path
from .views import trending, movie_details, movie_rating

urlpatterns = [
    path("trending/", trending, name="trending"),
    path("<int:movie_id>/", movie_details, name="movie_details"),
    path("<int:movie_id>/rating/", movie_rating, name="movie_rating"),
]
