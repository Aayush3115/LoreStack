from rest_framework.routers import DefaultRouter
from .views import CommunityViewSet, CommunityRequestViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'loreroom', CommunityViewSet, basename='community')
router.register(r'community-requests', CommunityRequestViewSet, basename='community-request')

urlpatterns = [
    path('', include(router.urls)),
]