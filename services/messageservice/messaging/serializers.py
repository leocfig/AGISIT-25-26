from rest_framework import serializers
from .models import GroupChat, Message
from .utils import get_auth_user_by_id

class GroupChatSerializer(serializers.ModelSerializer):
    users = serializers.SerializerMethodField()

    class Meta:
        model = GroupChat
        fields = ['public_id', 'id', 'name', 'users', 'is_direct']

    def get_users(self, obj):
        token = self.context.get("token")
        view = self.context.get("view")
        usernames = []
        for uid in obj.user_ids:
            user_info = get_auth_user_by_id(uid, token)
            if user_info:
                usernames.append(user_info["username"])
        return usernames

class MessageSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    text = serializers.CharField(source='content')

    class Meta:
        model = Message
        fields = ['user', 'text', 'timestamp']

    def get_user(self, obj):
        token = self.context.get("token")
        view = self.context.get("view")
        user_info = get_auth_user_by_id(obj.sender_id, token)
        return user_info["username"] if user_info else "Unknown"
