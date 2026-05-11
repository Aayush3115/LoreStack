from rest_framework import permissions

class IsEmailVerified(permissions.BasePermission):
    """
    Allows access only to users who have verified their email.
    """
    def has_permission(self, request, view):
        # Get the name of the view (works for both class-based and function-based views)
        view_name = view.__class__.__name__
        if hasattr(view, 'view_class'):
            view_name = view.view_class.__name__
        elif hasattr(view, '__name__'):
            view_name = view.__name__
            
        exempt_views = [
            'VerifyOTPView',
            'SendOTPView',
            'LogoutView',
            'UserProfileView',
            'UserViewSet',
            'RegisterView',
            'TokenObtainPairView',
            'MyTokenObtainPairView',
            'GoogleLoginView',
            'TokenRefreshView'
        ]
        
        if view_name in exempt_views:
            return True
            
        return bool(request.user and request.user.is_authenticated and request.user.email_verified)
