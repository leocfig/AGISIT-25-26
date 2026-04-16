from django.contrib import admin
from .models import GroupChat, Message

@admin.register(GroupChat)
class GroupChatAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "public_id", "is_direct", "user_ids_display")
    search_fields = ("name", "public_id")
    
    def user_ids_display(self, obj):
        return ", ".join(str(uid) for uid in obj.user_ids)
    user_ids_display.short_description = "User IDs"


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "groupchat", "sender_id", "timestamp", "seen_by_ids_display")
    list_filter = ("groupchat", "timestamp")
    search_fields = ("content", "groupchat__public_id")

    def seen_by_ids_display(self, obj):
        return ", ".join(str(uid) for uid in obj.seen_by_ids)
    seen_by_ids_display.short_description = "Seen by IDs"