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
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
import requests
from django.core.files.base import ContentFile
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
        
        # Generate tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'User registered successfully'
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
