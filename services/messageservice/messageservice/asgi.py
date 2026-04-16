"""
ASGI config for messageservice project.

It exposes the ASGI callable as a module-level variable named ``application``.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
import messaging.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'messageservice.settings')

asgi_application = get_asgi_application()

application = ProtocolTypeRouter({
    "http": asgi_application,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                messaging.routing.websocket_urlpatterns
            )
        )
    ),
})
