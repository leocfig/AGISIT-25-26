from locust import HttpUser, task, between
import random
import string

def random_user():
    """Generate a unique random username/password pair."""
    username = "user_" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    password = "yoooaaaa"
    return username, password


class WebAppUser(HttpUser):
    """
    Simulates a real user that:
      1. Registers (if needed)
      2. Logs in
      3. Visits /dashboard and /api/data
      4. Logs out
    """
    wait_time = between(1, 3)  # random think time between requests (in seconds)

    def on_start(self):
        """Run when each simulated user starts — register + login."""
        self.username, self.password = random_user()

        # Try to register first (if user already exists, it can safely 409/conflict)
        register_resp = self.client.post(
            "/api/users/register/",
            json={
                "username": self.username,
                "password": self.password,
                "password2": self.password,
                "email": f"{self.username}@test.com"
            },
            name="/api/users/register/"
        )

        if register_resp.status_code in (200, 201):
            print(f"[OK] Registered new user: {self.username}")
        elif register_resp.status_code == 409:
            print(f"[WARN] User {self.username} already exists, continuing to login.")
        else:
            print(f"[ERR] Register failed for {self.username} ({register_resp.status_code})")

        # Try logging in
        login_resp = self.client.post(
            "/api/users/token/",
            json={
                "username": self.username,
                "password": self.password
            },
            name="/api/users/token/"
        )

        if login_resp.status_code == 200 and "access" in login_resp.json():
            access_token = login_resp.json()["access"]
            self.client.headers.update({"Authorization": f"Bearer {access_token}"})
            print(f"[OK] Logged in as {self.username}")
        else:
            print(f"[ERR] Login failed for {self.username}: {login_resp.status_code}")

    @task(3)
    def view_friends(self):
        self.client.get("/api/messaging/my_friends/", name="/api/messaging/my_friends/")

    @task(2)
    def view_groupchats(self):
       self.client.get("/api/messaging/my_groupchats/", name="/api/messaging/my_groupchats/")

    @task(2)
    def view_groupchats(self):
       self.client.get("/api/messaging/my_directmessages/", name="/api/messaging/my_directmessages/")

    @task(1)
    def view_homepage(self):
        self.client.get("/", name="/")