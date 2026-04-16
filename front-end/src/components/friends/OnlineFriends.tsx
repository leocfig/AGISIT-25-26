// OnlineFriends.tsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Friend } from "../types";
import { useOnlineUsers } from "../../hook/useOnlineUsers";

interface OnlineFriendsProps {
  friends: Friend[];
  token: string | null;
  userName: string;
}

const OnlineFriends: React.FC<OnlineFriendsProps> = ({ friends = [], token }) => {
  const { t } = useTranslation();
  const onlineSet = useOnlineUsers(token, friends, { intervalMs: 4_000 });
  const onlineFriends = useMemo(() => {
    const isOnline = (u: string) => onlineSet.has((u || "").trim().toLowerCase());
    return friends
      .map(f => ({ ...f, online: isOnline(f.username) }))
      .filter(f => f.online);
  }, [friends, onlineSet]);

  return (
    <div className="bg-gray-700 p-4 rounded-2xl">
      <h3 className="text-white font-bold mb-3">{t("selectMessages.onlineFriends")}</h3>
      {onlineFriends.length === 0 ? (
        <div className="text-gray-400 text-sm italic">
          {t("selectMessages.noOnlineFriends", "No friends online")}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto">
          {onlineFriends.map(f => (
            <div
              key={f.id}
              className="bg-gray-600 text-white px-4 py-2 rounded-2xl flex items-center justify-center flex-shrink-0"
            >
              <span className="relative pr-3">
                {f.username}
                <span className="absolute -right-1 -top-1 inline-block w-2 h-2 bg-green-500 rounded-full" />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OnlineFriends;
