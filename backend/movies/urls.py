from django.urls import path
from .views import trending_movies

urlpatterns = [
    path("trending/", trending_movies, name="trending"),
]
