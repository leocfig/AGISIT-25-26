from django.urls import re_path
from . import consumers

# WebSocket URL routing for group chats
# Any connection to ws/messaging/<group_public_id>/ will be handled by GroupChatConsumer
websocket_urlpatterns = [
    re_path(
        r"api/messaging/ws/messaging/(?P<group_id>[0-9a-f-]+)/$",
        consumers.GroupChatConsumer.as_asgi()
    ),
    re_path(r"api/messaging/ws/notifications/$", consumers.NotificationsConsumer.as_asgi()),
]


