# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from metrics import check_db_health, messageservice_health
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from .models import GroupChat, Friendship
from .serializers import GroupChatSerializer, MessageSerializer
from rest_framework import status
from .utils import get_auth_user_by_id, get_auth_user_by_username
from metrics import groupchats_created_total, check_db_health
import logging

logger = logging.getLogger(__name__)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class MyGroupChatsView(APIView):
    def get(self, request):
        groupchats = GroupChat.objects.filter(
            is_direct=False,
            user_ids__contains=[request.user.id]
        )

        data = []
        token = request.headers.get("Authorization")

        for gc in groupchats:
            messages = gc.messages.order_by('timestamp')

            unseen_count = messages.exclude(
                seen_by_ids__contains=[request.user.id]
            ).exclude(sender_id=request.user.id).count()

            users_data = []
            for uid in gc.user_ids:
                user_info = get_auth_user_by_id(uid, token)
                if user_info:
                    users_data.append(user_info["username"])

            last_message = messages.last()
            data.append({
                "id": gc.id,
                "public_id": gc.public_id,
                "name": gc.name,
                "users": users_data,
                "unseen_count": unseen_count,
                "last_message": last_message.content if last_message else "",
                "last_message_timestamp": last_message.timestamp if last_message else None,
                "last_message_sender": (
                    get_auth_user_by_id(last_message.sender_id, token)["username"]
                    if last_message else None
                ),
            })

        return Response(data)

    def post(self, request):
        name = request.data.get("name")
        members = request.data.get("members", [])

        if not name:
            return Response({"error": "Name is required"}, status=400)

        # Create or get existing group chat
        try:
            groupchat, created = GroupChat.objects.get_or_create(
                name=name,
                defaults={"is_direct": False, "user_ids": [request.user.id]},
            )
        except Exception as e:
            return Response({"error": f"Error creating/fetching GroupChat: {e}"}, status=500)
        
        if created:
            groupchats_created_total.inc()

        # Ensure the creator is in the chat
        if request.user.id not in groupchat.user_ids:
            groupchat.user_ids.append(request.user.id)

        token = request.headers.get("Authorization")

        # Add additional members
        for username in members:
            user_info = get_auth_user_by_username(username, token)
            if not user_info:
                return Response({"error": f"User '{username}' not found"}, status=400)
            if user_info["id"] not in groupchat.user_ids:
                groupchat.user_ids.append(user_info["id"])

        groupchat.save()

        serializer = GroupChatSerializer(groupchat)
        return Response(serializer.data, status=201 if created else 200)

class LeaveGroupChatView(APIView):
    def delete(self, request, public_id):
        if not request.user or not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)

        try:
            groupchat = GroupChat.objects.get(public_id=public_id, is_direct=False)
        except GroupChat.DoesNotExist:
            return Response({"error": "Group chat not found"}, status=404)

        user_id_str = str(request.user.id)

        if user_id_str not in map(str, groupchat.user_ids):
            return Response({"error": "You are not a member of this group"}, status=400)

        # Remove user from group chat
        groupchat.user_ids = [uid for uid in groupchat.user_ids if str(uid) != user_id_str]
        groupchat.save()

        # Delete group chat if empty
        if not groupchat.user_ids:
            groupchat.delete()
            return Response(
                {"message": "You left the group. Group deleted as it has no members."},
                status=200
            )

        return Response({"message": "You have left the group successfully."}, status=200)


class MyDirectMessagesView(APIView):
    """
    Endpoints to list and create direct message (DM) group chats.
    """
    def get(self, request):
        directmessages = GroupChat.objects.filter(
            is_direct=True,
            user_ids__contains=[request.user.id]
        )

        data = []
        token = request.headers.get("Authorization")

        for dm in directmessages:
            messages = dm.messages.order_by('timestamp')
            unseen_count = messages.exclude(seen_by_ids__contains=[request.user.id]) \
                        .exclude(sender_id=request.user.id) \
                        .count()

            users_data = []
            for uid in dm.user_ids:
                user_info = get_auth_user_by_id(uid, token)
                if user_info:
                    users_data.append(user_info["username"])

            last_message = messages.last()
            data.append({
                "id": dm.id,
                "public_id": dm.public_id,
                "name": dm.name,
                "users": users_data,
                "unseen_count": unseen_count,
                "last_message": last_message.content if last_message else "",
                "last_message_timestamp": last_message.timestamp if last_message else None,
                "last_message_sender": (
                    get_auth_user_by_id(last_message.sender_id, token)["username"]
                    if last_message else None
                ),
            })

        return Response(data)

    def post(self, request):
        
        try:
            other_username = request.data.get("username")
            if not other_username:
                return Response(
                    {"error": "Missing username."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = request.headers.get("Authorization")

           
            other_user_data = get_auth_user_by_username(other_username, token)
            if not other_user_data:
                return Response(
                    {"error": "User not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            
            usernames = sorted([request.user.username, other_username])
            dm_name = f"{usernames[0]} - {usernames[1]}"

            
            groupchat, created = GroupChat.objects.get_or_create(
                name=dm_name,
                defaults={
                    "is_direct": True,
                    "user_ids": [request.user.id, other_user_data["id"]],
                },
            )
            
            if not created:
               
                if request.user.id not in groupchat.user_ids:
                    groupchat.user_ids.append(request.user.id)
                if other_user_data["id"] not in groupchat.user_ids:
                    groupchat.user_ids.append(other_user_data["id"])

            
            groupchat.save()

            
            if created:
                try:
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        f"user_{other_user_data['id']}_notifications",
                        {
                            "type": "notify",
                            "data": {
                                "type": "new_chat",
                                "chat_id": str(groupchat.public_id),
                                "name": groupchat.name,
                                "is_direct": True,
                            },
                        },
                    )
                    logger.warning(f"[WS] Notification sent to user_{other_user_data['id']}_notifications")
                except Exception as e:
                    logger.warning(f"[WS ERROR] Error sending the notification: {repr(e)}")

           
            serializer = GroupChatSerializer(groupchat)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        except Exception as e:
            logger.warning("[ERROR] MyDirectMessagesView.post:", repr(e))
            return Response(
                {"error": "Internal server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MyFriendsView(APIView):
    def get(self, request):
        friends = Friendship.objects.filter(user_id=request.user.id)
        data = []

        token = request.headers.get("Authorization")
        for f in friends:
            user_data = get_auth_user_by_id(f.friend_id, token)
            if user_data:
                data.append({
                    "id": user_data["id"],
                    "username": user_data["username"],
                })

        return Response(data)

    def post(self, request):
        username = request.data.get("username")
        if not username:
            return Response({"error": "Username is required"}, status=400)
        
        token = request.headers.get("Authorization")

        friend_data = get_auth_user_by_username(username, token)
        if not friend_data:
            return Response({"error": "User not found"}, status=404)

        # Create friendship both ways (mutual)
        Friendship.objects.get_or_create(
            user_id=request.user.id,
            friend_id=friend_data["id"]
        )

        return Response({
            "id": friend_data["id"],
            "username": friend_data["username"]
        }, status=201)
    
    def delete(self, request):
        username = request.data.get("username")
        if not username:
            return Response({"error": "Username is required"}, status=400)

        token = request.headers.get("Authorization")
        friend_data = get_auth_user_by_username(username, token)
        if not friend_data:
            return Response({"error": "User not found"}, status=404)

        Friendship.objects.filter(
            user_id=request.user.id,
            friend_id=friend_data["id"]
        ).delete()

        Friendship.objects.filter(
            user_id=friend_data["id"],
            friend_id=request.user.id
        ).delete()

        return Response({"success": f"{username} removed from friends."}, status=200)
        
class GroupChatMessagesView(APIView):
    def get(self, request, public_id):
        try:
            groupchat = GroupChat.objects.get(public_id=public_id)
        except GroupChat.DoesNotExist:
            return Response({"error": "Group chat not found"}, status=404)

        messages = groupchat.messages.order_by('timestamp')

        # mark as seen
        for msg in messages:
            if request.user.id not in msg.seen_by_ids:
                msg.seen_by_ids.append(request.user.id)
                msg.save()

        serializer = MessageSerializer(
            messages,
            many=True,
            context={"token": request.headers.get("Authorization"), "view": self}
        )
        return Response(serializer.data)

class AddUserToGroupChatView(APIView):
    def post(self, request, public_id):
        username = request.data.get("username")
        if not username:
            return Response({"error": "Username is required"}, status=400)

        try:
            groupchat = GroupChat.objects.get(public_id=public_id, is_direct=False)
        except GroupChat.DoesNotExist:
            return Response({"error": "Group chat not found"}, status=404)

        token = request.headers.get("Authorization")
        user_info = get_auth_user_by_username(username, token)
        if not user_info:
            return Response({"error": "User not found"}, status=404)

        if user_info["id"] in groupchat.user_ids:
            serializer = GroupChatSerializer(groupchat)
            return Response(
                {"message": "User already in group", "groupchat": serializer.data},
                status=200
            )

        groupchat.user_ids.append(user_info["id"])
        groupchat.save()

        serializer = GroupChatSerializer(groupchat)
        return Response(
            {"message": f"{username} added to group", "groupchat": serializer.data},
            status=201
        )
    
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    check_db_health()
    return Response({
        "status": "ok" if messageservice_health._value.get() == 1 else "down"
    })
