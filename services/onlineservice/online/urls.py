from django.urls import path
from .views import heartbeat, logout_view, presence_one, presence_batch, presence_by_usernames

urlpatterns = [
    path("online/heartbeat", heartbeat, name="online-heartbeat"),
    path("online/logout", logout_view, name="online-logout"),
    path("online", presence_batch, name="online-batch"),
    path("online/usernames", presence_by_usernames, name="online-by-usernames"),
    path("online/<str:user_id>", presence_one, name="online-one"),
    
]
