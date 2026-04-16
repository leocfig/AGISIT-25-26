import os
import jwt
import httpx
from django.conf import settings
import requests
import logging

logger = logging.getLogger(__name__)

AUTH_USERINFO_URL = os.environ.get("AUTH_USERINFO_URL","http://authservice:8000/api/users/userinfo/")
AUTH_USERNAME_URL = os.environ.get("AUTH_USERNAME_URL","http://authservice:8000/api/users/username/{username}/")
AUTH_USERID_URL = os.environ.get("AUTH_USERID_URL","http://authservice:8000/api/users/{user_id}/")

def _decode_user_from_jwt(token: str):
    if not token:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.SIMPLE_JWT["SIGNING_KEY"],
            algorithms=[settings.SIMPLE_JWT["ALGORITHM"]],
        )
        return {
            "user_id": payload.get("user_id") or payload.get("sub"),
            "username": payload.get("username"),
        }
    except Exception:
        return None

async def get_user_from_token(token: str):
    """
    Requests the user information from the Auth service.
    Returns a dictionary with the user's claims if valid, or None if invalid.
    """

    user = _decode_user_from_jwt(token)
    if user:
        return user
    
    if not token:
        return None
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(
                AUTH_USERINFO_URL,
                headers={"Authorization": f"Bearer {token}"}
            )
            if r.status_code == 200:
                data = r.json()
                return {
                    "user_id": data.get("user_id") or data.get("sub"),
                    "username": data.get("username"),
                }
    except Exception:
        pass
    return None

def get_auth_user_by_id(user_id, token):
    headers = {"Authorization": token} if token else {}
    url = AUTH_USERID_URL.format(user_id=user_id)
    try:
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            return resp.json()
    except requests.RequestException:
        pass
    return None

def get_auth_user_by_username(username, token):
    headers = {"Authorization": token} if token else {}
    url = AUTH_USERNAME_URL.format(username=username)
    try:
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            return resp.json()
    except requests.RequestException as e:
        logger.warning("Request failed:", e)
    return None