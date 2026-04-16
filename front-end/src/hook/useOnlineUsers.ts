import { useEffect, useMemo, useRef, useState } from "react";

export interface FriendLike {
  id: number | string;
  username: string;
}

export function useOnlineUsers(
  accessToken: string | null | undefined,
  friends: FriendLike[],
  { intervalMs = 4_000 }: { intervalMs?: number } = {}
) {
  const [onlineSet, setOnlineSet] = useState<Set<string>>(new Set());
  const timerRef = useRef<number | undefined>();
  const kickRef = useRef<number | undefined>();

  const PRESENCE_BY_USERNAMES_URL = `/api/online/usernames`;

  const usernamesParam = useMemo(() => {
    if (!friends || friends.length === 0) return "";
    const uniq = Array.from(
      new Set(friends.map(f => (f.username ?? "").trim().toLowerCase()))
    ).sort();
    return uniq.join(",");
  }, [friends]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    if (kickRef.current) {
      clearTimeout(kickRef.current);
      kickRef.current = undefined;
    }
    setOnlineSet(new Set());
  }, [usernamesParam]);

  useEffect(() => {
    if (!accessToken) return;
    if (!usernamesParam) return;
    let disposed = false;

    const fetchPresence = async () => {
      try {
        const url = `${PRESENCE_BY_USERNAMES_URL}?usernames=${encodeURIComponent(usernamesParam)}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
        if (!res.ok) {
          return;
        }
        const data: any = await res.json();
        const results = Array.isArray(data?.results) ? data.results : [];
        const onlines = results
          .filter((r: any) => r?.online)
          .map((r: any) => String(r.username).toLowerCase());
        if (!disposed) 
          setOnlineSet(new Set(onlines));
      } catch {}
    };

    fetchPresence();
    kickRef.current = window.setTimeout(fetchPresence, 1_000);
    timerRef.current = window.setInterval(fetchPresence, intervalMs);

    const onVis = () => {
      if (!document.hidden) fetchPresence();
    };
    const onOnline = () => fetchPresence();

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("online", onOnline);

    return () => {
      disposed = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (kickRef.current) clearTimeout(kickRef.current);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("online", onOnline);
    };
  }, [accessToken, usernamesParam, intervalMs]);

  return onlineSet;
}
