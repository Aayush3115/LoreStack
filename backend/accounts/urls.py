from rest_framework.routers import DefaultRouter
from .views import UserViewSet
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from .views import RegisterView,LogoutView,UserProfileView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')

urlpatterns = router.urls

urlpatterns=[
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),

]