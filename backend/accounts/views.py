from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer
from rest_framework import generics,status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer,UserSerializer,UserUpdateSerializer
from django.db.models import Q
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
import requests
from django.core.files.base import ContentFile
from .utils import generate_otp, send_otp_email
from .models import EmailVerification

# Create your views here.


User=get_user_model()

class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see themselves (safe default)
        return User.objects.filter(id=self.request.user.id)
    
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate and send OTP
        otp = generate_otp()
        EmailVerification.objects.update_or_create(
            user=user,
            defaults={'otp': otp, 'is_verified': False}
        )
        send_otp_email(user.email, otp)
        
        # Generate tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'User registered successfully. Please verify your email with the OTP sent.'
        }, status=status.HTTP_201_CREATED)

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {"message": "Logout successful"}, 
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class UserProfileView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request):
        serializer = UserUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PublicUserProfileView(APIView):
    permission_classes = (AllowAny,)
    
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            serializer = UserSerializer(user, context={'request': request})
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class FollowToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        try:
            target_user = User.objects.get(username=username)
            if target_user == request.user:
                return Response({"error": "You cannot follow yourself"}, status=status.HTTP_400_BAD_REQUEST)
            
            if request.user.following.filter(id=target_user.id).exists():
                request.user.following.remove(target_user)
                return Response({
                    "status": "unfollowed", 
                    "is_following": False,
                    "followers_count": target_user.followers.count()
                })
            else:
                request.user.following.add(target_user)
                return Response({
                    "status": "followed", 
                    "is_following": True,
                    "followers_count": target_user.followers.count()
                })
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class GoogleLoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
            if not client_id:
                return Response({'error': 'GOOGLE_CLIENT_ID not configured in backend'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Verify the token
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)

            # ID token is valid. Get the user's Google Account ID from the decoded token.
            email = idinfo['email']
            
            # Get or create user
            user, created = User.objects.get_or_create(email=email, defaults={
                'username': (idinfo.get('given_name', email.split('@')[0]) + '_' + User.objects.make_random_password(length=4)).lower(),
                'first_name': idinfo.get('given_name', ''),
                'last_name': idinfo.get('family_name', ''),
                'bio': 'Signed in via Google',
                'email_verified': True
            })


            # If user has a Google profile picture and doesn't have one set or is new
            google_pic_url = idinfo.get('picture')
            if google_pic_url:
                try:
                    # Only download if it's a new user or they still have the default picture
                    if created or 'default.jpg' in user.profile_picture.url:
                        response = requests.get(google_pic_url)
                        if response.status_code == 200:
                            # Use email as filename prefix
                            file_name = f"{user.username}_google_pic.jpg"
                            user.profile_picture.save(file_name, ContentFile(response.content), save=True)
                except Exception as e:
                    print(f"Failed to download Google profile pic: {e}")


            # Generate tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'user': UserSerializer(user, context={'request': request}).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Login successful',
                'is_new_user': created
            })

        except ValueError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserSearchView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def get(self, request):
        query = request.query_params.get('query', '')
        if not query:
            return Response([])
        
        users = User.objects.filter(
            Q(username__icontains=query) | 
            Q(first_name__icontains=query) | 
            Q(last_name__icontains=query)
        ).exclude(id=request.user.id)[:10]
        
        serializer = UserSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)

class SendOTPView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        user = request.user
        if user.email_verified:
            return Response({'message': 'Email already verified'}, status=status.HTTP_400_BAD_REQUEST)
        
        otp = generate_otp()
        EmailVerification.objects.update_or_create(
            user=user,
            defaults={'otp': otp, 'is_verified': False}
        )
        send_otp_email(user.email, otp)
        return Response({'message': 'OTP sent to your email'})

class VerifyOTPView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        otp = request.data.get('otp')
        if not otp:
            return Response({'error': 'OTP is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            verification = EmailVerification.objects.get(user=request.user, otp=otp)
            # Check if expired (e.g., 10 minutes)
            from django.utils import timezone
            if (timezone.now() - verification.created_at).total_seconds() > 600:
                return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)
            
            request.user.email_verified = True
            request.user.save()
            verification.is_verified = True
            verification.save()
            
            return Response({'message': 'Email verified successfully'})
        except EmailVerification.DoesNotExist:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
