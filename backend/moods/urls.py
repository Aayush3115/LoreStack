from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MoodViewSet, mood_recommendations

router = DefaultRouter()
router.register(r'list', MoodViewSet, basename='moods')

urlpatterns = [
    path('', include(router.urls)),
    path('recommendations/', mood_recommendations, name='mood-recommendations'),
]
