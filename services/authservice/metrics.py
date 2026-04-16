from prometheus_client import Counter, Gauge
from django.db import connection

# Counters for authentication actions
auth_login_success_total = Counter(
    'auth_login_success_total', 'Total successful logins'
)
auth_login_failure_total = Counter(
    'auth_login_failure_total', 'Total failed logins'
)
auth_registration_success_total = Counter(
    'auth_registration_success_total', 'Total successful registrations'
)
auth_registration_failure_total = Counter(
    'auth_registration_failure_total', 'Total failed registrations'
)

# Health metric
authservice_health = Gauge(
    'authservice_health', 'Health status of AuthService (1=healthy, 0=unhealthy)'
)


def check_db_health():
    """Check if the database connection is healthy and update the gauge."""
    try:
        connection.ensure_connection()
        authservice_health.set(1)
    except Exception:
        authservice_health.set(0)
