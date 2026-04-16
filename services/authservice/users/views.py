from django.contrib.auth.models import User
from users.serializers import RegistrationSerializaer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from metrics import auth_registration_success_total, auth_registration_failure_total, auth_login_success_total, auth_login_failure_total, check_db_health, authservice_health
from metrics import check_db_health, authservice_health

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            auth_login_success_total.inc()
            return response
        except Exception:
            auth_login_failure_total.inc()
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

class RegisterView(generics.CreateAPIView):
    serializer_class = RegistrationSerializaer
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()
            auth_registration_success_total.inc()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            auth_registration_failure_total.inc()
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            auth_registration_failure_total.inc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def userinfo(request):
    user = request.user
    return Response({
        "sub": str(user.id),
        "username": user.username,
        "email": user.email,
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_by_id(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email
        })
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_by_username(request, username):
    try:
        user = User.objects.get(username=username)
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email
        })
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    check_db_health()
    return Response({
        "status": "ok" if authservice_health._value.get() == 1 else "down"
    })