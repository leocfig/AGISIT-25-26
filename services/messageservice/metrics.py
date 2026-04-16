from prometheus_client import Counter, Gauge
from django.db import connection

# Messaging counters
messages_sent_total = Counter(
    'messages_sent_total', 'Total number of messages successfully sent'
)
messages_failed_total = Counter(
    'messages_failed_total', 'Number of message send attempts that failed'
)
groupchats_created_total = Counter(
    'groupchats_created_total', 'Total number of group chats created'
)

# Health status
messageservice_health = Gauge(
    'messageservice_health', 'Health status of MessageService (1=healthy, 0=unhealthy)'
)

def check_db_health():
    """Check DB connectivity and update health gauge."""
    try:
        connection.ensure_connection()
        messageservice_health.set(1)
    except Exception:
        messageservice_health.set(0)
