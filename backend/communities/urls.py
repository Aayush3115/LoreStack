from rest_framework.routers import DefaultRouter
from .views import CommunityViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'community', CommunityViewSet, basename='community')

urlpatterns = [
    path('', include(router.urls)),
]