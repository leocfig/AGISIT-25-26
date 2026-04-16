// DirectMessages.tsx
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatTimestamp } from "../../utils/formatTimestamp";
import type { GroupChat } from "../types";

interface DirectMessagesProps {
  chats: GroupChat[];
  onSelect: (chat: { id: string; name: string }) => void;
  token: string | null;
  fetchChats: () => Promise<void>;
}

const DirectMessages: React.FC<DirectMessagesProps> = ({
  chats,
  onSelect,
  token,
  fetchChats,
}) => {
  const { t } = useTranslation();
  const socketsRef = useRef<Map<string, WebSocket>>(new Map());

  const [chatList, setChatList] = useState<GroupChat[]>(chats);

  useEffect(() => {
    setChatList(chats);
  }, [chats]);

 

  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(
      `ws://${window.location.host}/api/messaging/ws/notifications/?token=${token}`
    );

    socket.onopen = () => console.log("Connected to the notifications socket");

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "new_message") {
        setChatList( (prev) => {
          const chatExists = prev.some((c) => c.public_id === data.chat_id);

          if (!chatExists) {
            fetchChats();
            return prev;
          }

          return prev.map((c) =>
            c.public_id === data.chat_id
              ? {
                  ...c,
                  unseen_count: (c.unseen_count ?? 0) + 1,
                  last_message: data.message,
                  last_message_sender: data.sender,
                  last_message_timestamp: data.timestamp,
                }
              : c
          );
        });
      }
    };

    socket.onerror = (err) =>
      console.error("Erro no socket de notificações:", err);

    return () => socket.close();
  }, [token]);

  const handleSelect = (chat: { id: string; name: string }) => {
    onSelect(chat);

    setChatList((prevChats) =>
      prevChats.map((c) =>
        c.public_id === chat.id ? { ...c, unseen_count: 0 } : c
      )
    );
  };

  return (
    <div className="bg-gray-700 p-4 rounded-2xl flex-1 overflow-y-auto">
      <h3 className="text-white font-bold mb-3">
        {t("selectMessages.listDirectMessages")}
      </h3>
      {chatList.map((chat) => (
        <button
          key={chat.id}
          onClick={() => handleSelect({ id: chat.public_id, name: chat.name })}
          className="block w-full bg-gray-600 text-white p-3 rounded-2xl mb-3 text-left hover:bg-gray-500 cursor-pointer duration-150"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">{chat.name}</span>
            {chat.unseen_count! > 0 && (
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-2 font-bold">
                {chat.unseen_count}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center mt-1">
            {chat.last_message ? (
              <div className="text-gray-300 text-sm truncate">
                <span className="font-semibold">
                  {chat.last_message_sender}:{" "}
                </span>
                {chat.last_message}
              </div>
            ) : (
              <div className="text-gray-400 text-sm italic flex-1">
                {t("selectMessages.noMessages")}
              </div>
            )}
            {chat.last_message_timestamp && (
              <span className="text-gray-400 text-xs ml-2 shrink-0">
                {formatTimestamp(chat.last_message_timestamp)}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default DirectMessages;
