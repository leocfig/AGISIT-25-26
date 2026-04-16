import os, json
import requests
from django.utils.deprecation import MiddlewareMixin

import logging

logger = logging.getLogger(__name__)

HEARTBEAT_URL = os.environ.get('ONLINE_HEARTBEAT_URL', 'http://onlineservice:8000/api/online/heartbeat')

class HeartbeatAfterTokenMiddleware(MiddlewareMixin):
    TOKEN_PATHS = { '/api/users/token/'}

    def process_response(self, request, response):
        try:
            if request.path in self.TOKEN_PATHS and getattr(response, "status_code", 0) == 200:
                content = response.content
                if isinstance(content, bytes):
                    content = content.decode('utf-8', errors='ignore')
                if 'application/json' in (response.get('Content-Type') or ''):
                    data = {}
                    try:
                        data = json.loads(content or "{}")
                    except json.JSONDecodeError:
                        pass
                    access = data.get('access')

                    if access:
                        requests.post(
                            HEARTBEAT_URL,
                            headers={'Authorization': f'Bearer {access}'},
                            timeout=5
                        )
        except Exception as e:
            logger.warning(f"[WARN] HeartbeatAfterTokenMiddleware error: {e}")
        return response