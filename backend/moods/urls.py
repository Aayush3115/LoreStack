from rest_framework.routers import DefaultRouter
from .views import MoodViewSet

router = DefaultRouter()
router.register(r'moods', MoodViewSet, basename='moods')

urlpatterns = router.urls
