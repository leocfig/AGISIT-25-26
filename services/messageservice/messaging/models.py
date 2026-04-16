import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField

class GroupChat(models.Model):
    
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=255, unique=True)
    
    # To distinguish direct message from actual group chats
    is_direct = models.BooleanField(default=False)

    user_ids = ArrayField(models.IntegerField())
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{'DM' if self.is_direct else 'GroupChat'}: {self.name} ({self.public_id})"

class Message(models.Model):
    # The group chat this message belongs to
    # For DMs, this can be a group chat between two users
    groupchat = models.ForeignKey(
        GroupChat,
        related_name='messages',
        on_delete=models.CASCADE
    )

    # The user who sent the message
    sender_id = models.IntegerField()

    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    seen_by_ids = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"[{self.timestamp}] User {self.sender_id} in {self.groupchat.name}: {self.content[:20]}"

class Friendship(models.Model):
    user_id = models.IntegerField()
    friend_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user_id", "friend_id")

    def __str__(self):
        return f"{self.user_id} ↔ {self.friend_id}"
