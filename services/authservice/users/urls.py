from django.urls import path
from .views import MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import RegisterView, userinfo, get_user_by_id, get_user_by_username

urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('userinfo/', userinfo, name='userinfo'),
    path('<int:user_id>/', get_user_by_id, name='get_user_by_id'),
    path('username/<str:username>/', get_user_by_username, name='get_user_by_username'),
]
