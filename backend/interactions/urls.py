from rest_framework.routers import DefaultRouter
from .views import CommentViewSet, VoteViewSet

router = DefaultRouter()
router.register(r'comments', CommentViewSet, basename='comments')
router.register(r'votes', VoteViewSet, basename='votes')

urlpatterns = router.urls
