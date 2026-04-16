import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from django.conf import settings

class JWTFromAuthServiceAuthentication(BaseAuthentication):
    """
    Global authentication class that trusts JWT tokens issued by authservice.
    Converts the JWT into a virtual user object for DRF.
    """
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None

        try:
            token_type, token = auth_header.split()
            if token_type.lower() != "bearer":
                return None
        except ValueError:
            raise exceptions.AuthenticationFailed("Invalid Authorization header format")

        # Decode the JWT
        try:
            payload = jwt.decode(token, settings.JWT_SHARED_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token expired")
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed("Invalid token")

        # Create a virtual user object compatible with DRF
        class VirtualUser:
            def __init__(self, user_id, username):
                self.id = user_id
                self.username = username
                self.is_authenticated = True

        user = VirtualUser(
            user_id=payload.get("user_id"),
            username=payload.get("username", f"user_{payload.get('user_id')}")
        )

        return (user, None)
