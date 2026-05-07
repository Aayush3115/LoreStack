from rest_framework.routers import DefaultRouter
from .views import UserViewSet
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from .views import RegisterView,LogoutView,UserProfileView,GoogleLoginView,PublicUserProfileView,FollowToggleView,UserSearchView,SendOTPView,VerifyOTPView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')

urlpatterns = router.urls

urlpatterns = router.urls + [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/search/', UserSearchView.as_view(), name='user_search'),
    path('profile/<str:username>/', PublicUserProfileView.as_view(), name='public_profile'),
    path('profile/<str:username>/follow/', FollowToggleView.as_view(), name='follow_user'),
    path('send-otp/', SendOTPView.as_view(), name='send_otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),

]