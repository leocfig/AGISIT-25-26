import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import GroupChat, Message
from asgiref.sync import sync_to_async
from .utils import get_user_from_token
from metrics import (
    messages_sent_total,
    messages_failed_total,
)
import logging

logger = logging.getLogger(__name__)

class GroupChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """
        Called when a WebSocket connection is opened.
        Determines the group chat from its public_id and joins the corresponding Channels group.
        """
        self.messaging_group_name = None
        self.user = None

        # Extract token from query string
        query_string = self.scope["query_string"].decode()
        token = query_string.split("token=")[-1] if "token=" in query_string else None
        self.user = await get_user_from_token(token)
        if not self.user:
            logger.warning("[WS] reject: invalid or missing token")
            await self.close(code=4003)
            return

        # Get the group public_id from the URL route
        self.group_id = self.scope["url_route"]["kwargs"].get("group_id")
        if not self.group_id:
            logger.warning("[WS] reject: missing group_id")
            await self.close(code=4002)
            return

        # Fetch the group chat by public_id
        group_chat = await sync_to_async(GroupChat.objects.filter(public_id=self.group_id).first)()
        if not group_chat:
            logger.warning("[WS] reject: group not found", self.group_id)
            await self.close(code=4004)
            return

        # Join the internal Channels group
        self.messaging_group_name = f"messaging_{self.group_id}"
        await self.channel_layer.group_add(self.messaging_group_name, self.channel_name)
        await self.accept()
        logger.warning("[WS] accepted:", self.messaging_group_name)

    async def disconnect(self, close_code):
        """
        Called when the WebSocket disconnects.
        Leaves the Channels group.
        """
        if self.messaging_group_name:
            await self.channel_layer.group_discard(self.messaging_group_name, self.channel_name)

    async def receive(self, text_data):
        """
        Called when a message is received from the WebSocket.
        Saves it to the database and broadcasts to the group.
        Uses only the virtual user info from the token.
        """
        try:
            data = json.loads(text_data or "{}")
            message_content = data.get("message")
            if not message_content:
                return  # ignore empty messages

        # Get user info from token
            user_id = self.user.get("user_id") or self.user.get("sub")
            username = self.user.get("username") or f"user_{user_id}"

            if not user_id:
                logger.warning("[WS] receive: no user_id in token", self.user)
                await self.close(code=4003)
                return

        # Fetch the group chat
            group_chat = await sync_to_async(GroupChat.objects.get)(public_id=self.group_id)

        # Save the message
            msg = await sync_to_async(Message.objects.create)(
                groupchat=group_chat,
                sender_id=user_id,
                content=message_content
            )

            # Increment successful message metric
            messages_sent_total.inc()

            # Broadcast the message to the group
            timestamp_iso = msg.timestamp.isoformat()  # timestamp em ISO

        # Broadcast to the chat group
            await self.channel_layer.group_send(
                self.messaging_group_name,
                {
                    "type": "deliver.message",
                    "sender": username,
                    "message": message_content,
                    "timestamp": timestamp_iso,
                }
            )

            # Send notification to other users
            for uid in group_chat.user_ids:
                if uid != user_id:  # não enviar notificação para quem enviou
                    user_group = f"user_{uid}_notifications"
                    await self.channel_layer.group_send(
                        user_group,
                        {
                            "type": "notify",
                            "data": {
                                "type": "new_message",
                                "chat_id": str(group_chat.public_id),
                                "message": message_content,
                                "sender": username,
                                "timestamp": timestamp_iso,
                            }
                        }
                    )

        except Exception as e:
            # Increment failure metric
            messages_failed_total.inc()
            logger.warning("[WS] receive error:", repr(e))


    async def deliver_message(self, event):
        """
        Called when a message is broadcasted to the group.
        Sends the message back to the WebSocket clients.
        """
        await self.send(text_data=json.dumps({
            "sender": event.get("sender"),
            "message": event.get("message"),
        }))

class NotificationsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope["query_string"].decode()
        token = query_string.split("token=")[-1] if "token=" in query_string else None
        self.user = await get_user_from_token(token)
        if not self.user:
            await self.close(code=4003)
            return
        
        self.user_group_name = f"user_{self.user['user_id']}_notifications"
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.user_group_name, self.channel_name)
    
    async def notify(self, event):
        await self.send(text_data=json.dumps(event["data"]))