from django.urls import path
from messaging.views import (
    MyGroupChatsView,
    MyDirectMessagesView,
    MyFriendsView,
    GroupChatMessagesView,
    AddUserToGroupChatView,
    LeaveGroupChatView,
)

urlpatterns = [
    path(
        "my_directmessages/", MyDirectMessagesView.as_view(), name="my_directmessages"
    ),
    path("my_groupchats/", MyGroupChatsView.as_view(), name="my_groupchats"),
    path(
        "my_groupchats/<uuid:public_id>/leave/",
        LeaveGroupChatView.as_view(),
        name="leave_groupchat",
    ),
    path("my_friends/", MyFriendsView.as_view(), name="my_groupchats"),
    path(
        "groupchats/<str:public_id>/add_user/",
        AddUserToGroupChatView.as_view(),
        name="add_user_to_groupchat",
    ),
    path(
        "<str:public_id>/messages/",
        GroupChatMessagesView.as_view(),
        name="groupchat_messages",
    ),
]
