import time
import jwt
from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from metrics import (
    heartbeats_total,
    users_online_gauge,
)
import logging

logger = logging.getLogger(__name__)

ONLINE_TTL = 10
User = get_user_model()

def _k(uid): return f"user:{uid}:online"

def _set_online(uid):
    cache.set(_k(uid), int(time.time() * 1000), timeout=ONLINE_TTL)
    users_online_gauge.inc()

def _del_online(uid):
    cache.delete(_k(uid))
    users_online_gauge.dec()

def _is_online(uid):
    ts = cache.get(_k(uid))
    return bool(ts and (time.time() * 1000) - ts < ONLINE_TTL * 1000)

def _auth_get_user_id(request):
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.split(" ", 1)[1]
    try:
        payload = jwt.decode(
            token,
            settings.AUTH_JWT_SECRET,
            algorithms=[settings.AUTH_JWT_ALG],
        )
    except Exception as e:
        logger.warning("[AUTH ERROR]", e)
        return None
    uid = payload.get("user_id") or payload.get("sub")
    return str(uid) if uid else None

def _k_username(uname: str): return f"username:{uname}:online"

def _set_online_username(uname: str):
    if uname:
        cache.set(_k_username(uname), int(time.time() * 1000), timeout=ONLINE_TTL)

def _del_online_username(uname: str):
    if uname:
        cache.delete(_k_username(uname))

def _is_online_username(uname: str):
    ts = cache.get(_k_username(uname))
    return bool(ts and (time.time() * 1000) - ts < ONLINE_TTL * 1000)

def _get_username_from_header(request) -> str:
    return (request.META.get("HTTP_X_USERNAME") or "").strip().lower()

def _get_username_from_body(request) -> str:
    try:
        data = getattr(request, "data", None)
        if not data and request.body:
            import json
            data = json.loads(request.body.decode("utf-8"))
    except Exception:
        data = None
    if isinstance(data, dict):
        return (data.get("username") or "").strip().lower()
    return ""

def _resolve_username(request, uid: str) -> str:
    """
    1) header X-USERNAME
    2) body.username
    3) DB lookup via uid
    """
    uname = _get_username_from_header(request)
    if not uname:
        uname = _get_username_from_body(request)
    if not uname and uid:
        try:
            u = User.objects.only("username").get(pk=uid)
            uname = (u.username or "").strip().lower()
        except User.DoesNotExist:
            uname = ""
    return uname

@api_view(["POST"])
def heartbeat(request):
    uid = _auth_get_user_id(request)
    if not uid:
        return HttpResponse(status=401)
    uname = _resolve_username(request, uid)
    _set_online(uid)
    heartbeats_total.inc()
    if uname:
        _set_online_username(uname)
    return Response({"ok": True, "user_id": uid, "username": uname, "online": True, "ttl_s": ONLINE_TTL})

@api_view(["POST"])
def logout_view(request):
    uid = _auth_get_user_id(request)
    if not uid:
        return HttpResponse(status=401)

    uname = _resolve_username(request, uid)
    _del_online(uid)
    if uname:
        _del_online_username(uname)
    return Response({"ok": True, "user_id": uid, "username": uname, "online": False})

@api_view(["GET"])
def presence_one(request, user_id: str):
    return Response({"user_id": user_id, "online": _is_online(user_id)})

@api_view(["GET"])
def presence_batch(request):
    ids = request.GET.get("ids", "")
    user_ids = [i for i in ids.split(",") if i]
    return Response({"results": [{"user_id": u, "online": _is_online(u)} for u in user_ids]})

@api_view(['GET'])
def presence_by_usernames(request):
    names = request.GET.get("usernames", "")
    usernames = [(n or "").strip().lower() for n in names.split(",") if (n or "").strip()]

    results = []
    for uname in usernames:
        online = _is_online_username(uname)
        if not online:
            try:
                u = User.objects.only("id").get(username__iexact=uname)
                online = _is_online(str(u.id))  
            except User.DoesNotExist:
                online = False
        results.append({"username": uname, "online": online})

    return Response({"results": results})

@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok"})
