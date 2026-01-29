from django.urls import path
from .views import trending

urlpatterns = [
    path("trending/", trending),
]