import { useEffect } from "react";

export function usePresence(accessToken?: string | null, username?: string) {
  useEffect(() => {
    if (!accessToken) return;

    const uname = (username ?? "").trim().toLowerCase();
    let timer: number | undefined;

    const HEARTBEAT_URL = `${window.location.protocol}//${window.location.host}/api/online/heartbeat`;
    const LOGOUT_URL    = `${window.location.protocol}//${window.location.host}/api/online/logout`;

    const heartbeat = () => {
      const headers: Record<string, string> = { Authorization: `Bearer ${accessToken}` };
      if (uname) headers["X-Username"] = uname;
      fetch(HEARTBEAT_URL, { 
          method: "POST",
          headers,
          keepalive: true,
        }).catch(() => {});
    };

    heartbeat();
    timer = window.setInterval(heartbeat, 5_000);

    const onUnload = () => {
      const headers: Record<string, string> = { Authorization: `Bearer ${accessToken}` };
      if (uname) headers["X-Username"] = uname;
      if (navigator.sendBeacon) {
        fetch(LOGOUT_URL, { method: "POST", headers, keepalive: true }).catch(() => {});
      } else {
        fetch(LOGOUT_URL, {
          method: "POST",
          headers,
          keepalive: true, 
        }).catch(() => {});
      }
    };

    window.addEventListener("beforeunload", onUnload);

    const onVis = () => {
      if (document.hidden) {
        if (timer) clearInterval(timer);
        timer = undefined;
      } else {
        heartbeat();
        if (!timer) timer = window.setInterval(heartbeat, 30_000);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      if (timer) clearInterval(timer);
      window.removeEventListener("beforeunload", onUnload);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [accessToken, username]);
}
