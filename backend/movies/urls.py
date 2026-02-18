from django.urls import path
from .views import trending,movie_details     

urlpatterns = [
    path("trending/", trending, name="trending"),
    path("<int:movie_id>/", movie_details, name="movie_details"),
]
