from prometheus_client import Counter, Gauge

# Total number of heartbeat requests received
heartbeats_total = Counter(
    "online_heartbeats_total",
    "Total number of heartbeat pings received"
)

# Number of users currently marked as online
users_online_gauge = Gauge(
    "online_users_current",
    "Current number of users marked as online"
)
