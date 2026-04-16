// GroupChats.tsx
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { formatTimestamp } from "../../utils/formatTimestamp";
import type { GroupChat } from "../types";

interface GroupChatsProps {
  chats: GroupChat[];
  onSelect: (chat: { id: string; name: string; isGroup?:boolean }) => void;
  token:string | null;
}

const GroupChats: React.FC<GroupChatsProps> = ({ chats, onSelect, token }) => {
  const { t } = useTranslation();
  const socketsRef = useRef<Map<string, WebSocket>>(new Map());
  const [chatList, setChatList] = useState<GroupChat[]>(chats);

  useEffect(() => {
    setChatList(chats);
  }, [chats]);

  useEffect(() => {
    // Creates a web connection for each group
    chats.forEach((chat) => {
      if (!socketsRef.current.has(chat.public_id)) {
        const socket = new WebSocket(
          `ws://${window.location.host}/api/messaging/ws/messaging/${chat.public_id}/?token=${token}`
        );

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);

          setChatList((prevChats) =>
            prevChats.map((c) =>
              c.public_id === chat.public_id
                ? {
                    ...c,
                    unseen_count: (c.unseen_count ?? 0) + 1,
                    last_message: data.message,
                    last_message_sender: data.sender_name || data.sender,
                    last_message_timestamp: data.timestamp || new Date().toISOString(),
                  }
                : c
            )
          );

        };

        socket.onerror = (err) => console.error(`Error in socket (${chat.name}):`, err);
        socketsRef.current.set(chat.public_id, socket);
      }
    });

    
    return () => {
      socketsRef.current.forEach((socket) => socket.close());
      socketsRef.current.clear();
    };
  }, [chats, token]);

  const handleSelect = (chat: { id: string; name: string; isGroup?: boolean }) => {
    onSelect(chat);
    setChatList((prevChats) =>
      prevChats.map((c) =>
        c.public_id === chat.id ? { ...c, unseen_count: 0 } : c
      )
    );
  };

  return (
    <div className="bg-gray-700 p-4 rounded-2xl flex-1 overflow-y-auto">
      <h3 className="text-white font-bold mb-3">{t("selectMessages.listGroupsChat")}</h3>
      {chatList.map(chat => (
        <button
          key={chat.id}
          onClick={() => handleSelect({ id: chat.public_id, name: chat.name, isGroup: true })}
          className="block w-full bg-gray-600 text-white p-3 rounded-2xl mb-3 text-left hover:bg-gray-500 cursor-pointer duration-150"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">{chat.name}</span>
            {chat.unseen_count! > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full ml-2 font-bold">
                {chat.unseen_count}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center mt-1">
            {chat.last_message ? (
              <div className="text-gray-300 text-sm truncate">
                <span className="font-semibold">{chat.last_message_sender}: </span>
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

export default GroupChats;
