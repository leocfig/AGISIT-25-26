import React, { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import LanguageModifier from "../LanguageModifier";
import { stringToColor } from "../../utils/colorUtils";
import {
  fetchGroupMessages,
  addUserToGroupChat,
  fetchFriends,
  leaveGroupChat
} from "../../api/messaging";
import { toast } from "react-toastify";
import CreateDMModal from "./CreateDMModal";

interface ChatWindowProps {
  groupChatId: string;
  groupChatName: string;
  token: string;
  currentUser: string;
  isGroup?:boolean
}

interface Message {
  user: string;
  text: string;
  timestamp: string;
}

interface RawMessage {
  sender?: string;
  user?: string;
  message?: string;
  text?: string;
  timestamp?: string;
  created_at?: string;
  sent_at?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  groupChatId,
  groupChatName,
  token,
  currentUser,
  isGroup
}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const userColorsRef = useRef<{ [key: string]: string }>({});
  const [friendModalOpen, setFriendModalOpen] = useState(false);
  const [friends, setFriends] = useState<{ id: number; username: string }[]>(
    []
  );

  const normalizeMessage = useCallback(
    (raw: RawMessage): Message => {
      const user = (raw.user || raw.sender || t("groupChat.unknownUser")) as string;
      const text = (raw.text || raw.message || "") as string;
      const timestamp =
        raw.timestamp || raw.created_at || raw.sent_at || new Date().toISOString();

      return {
        user,
        text,
        timestamp,
      };
    },
    [t]
  );

  const formatTimestamp = useCallback((timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }, []);

  const getInitial = (name: string) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase() || "?";
  };

  useEffect(() => {
    if (!groupChatId || !token) return;

    const loadMessages = async () => {
      try {
        const oldMessages = await fetchGroupMessages(token, groupChatId);
        if (Array.isArray(oldMessages)) {
          setMessages(oldMessages.map(normalizeMessage));
        } else if (oldMessages) {
          setMessages([normalizeMessage(oldMessages)]);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    loadMessages();

    const socket = new WebSocket(
      `ws://${window.location.host}/api/messaging/ws/messaging/${groupChatId}/?token=${token}`
    );
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, normalizeMessage(data)]);
    };

    const loadFriends = async () => {
      try {
        const userFriends = await fetchFriends(token);
        setFriends(userFriends);
      } catch (err) {
        console.error("Erro ao buscar amigos:", err);
      }
    };

    loadFriends();
    socket.onclose = (event) => {
      if (event.code === 1000) {
        console.log("[WS] closed normally");
      } else {
        console.error("[WS] closed unexpectedly, code:", event.code);
      }
    };
  
    socket.onerror = (err) => console.error("[WS] error:", err);

    return () => {
      socket.onmessage = null;
      socket.onclose = null;
      socket.onerror = null;
      socket.close();
      socketRef.current = null;
    };
  }, [groupChatId, token, normalizeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  messages.forEach((msg) => {
    if (msg.user && !userColorsRef.current[msg.user]) {
      userColorsRef.current[msg.user] = stringToColor(msg.user);
    }
  });

  const sendMessage = () => {
    if (socketRef.current && input.trim() !== "") {
      socketRef.current.send(JSON.stringify({ message: input }));
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  const hnadleAddFriendToGroup = async (friendName: string) => {
    const isFriend = friends.some(
      (friend) => friend.username.toLowerCase() === friendName.toLowerCase()
    );

    if (!isFriend) {
      console.error("This user is not on your friends list.");
      toast.error("This user is not on your friends list.");
      return;
    }

    try {
      await addUserToGroupChat(token, groupChatId, friendName);
      setFriendModalOpen(false);
      toast.success("User added successfully");
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Error adding user");
    }
  };

  const onLeaveGroupChat = async () => {
  try {
    const response = await leaveGroupChat(token, groupChatId);
    toast.success(response.message || "You left the group successfully");

    setMessages([]);
    if (socketRef.current) {
      socketRef.current.close(1000, "User left the group");
      socketRef.current = null;
    }

  } catch (error: any) {
    console.error("Error leaving group:", error);
    toast.error(error.response?.data?.error || "Failed to leave group");
  }
};

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "20px auto",
        fontFamily: "Arial, sans-serif",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        padding: "16px",
        backgroundColor: "#f9f9f9",
      }}
    >
      

      <LanguageModifier />

      <CreateDMModal
        isOpen={friendModalOpen}
        onClose={() => setFriendModalOpen(false)}
        onSubmit={(friendName: string) => hnadleAddFriendToGroup(friendName)}
        friends={friends}
        isAddToGroup={true}
      />
      <div className="flex justify-between items-center">
        <h2
          style={{ textAlign: "center", color: "#333", marginBottom: "16px" }}
        >
          {t("groupChat.title", { roomName: groupChatName })}
        </h2>
        {isGroup ? ( <div className="mb-4">
          <div
            className="mb-[16px] bg-indigo-600 border border-indigo-600 py-2 px-4 rounded-xl text-white font-bold cursor-pointer hover:bg-transparent hover:text-indigo-600 duration-150 text-center"
            onClick={() => setFriendModalOpen(true)}
          >
            {t("groupChat.addToGroup")}
          </div>
          <button className="bg-red-600 px-4 py-2 rounded-xl text-white font-bold border border-red-600 duration-150 hover:bg-transparent hover:text-red-600 cursor-pointer" onClick={()=> onLeaveGroupChat()}>
            {t("groupChat.leaveGroupChat")}
          </button>
        </div> ) : ( <div></div> )}
        
      </div>
      <div
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: "6px",
          padding: "12px",
          backgroundColor: "#fff",
          marginBottom: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {messages.map((msg, i) => {
          const isCurrentUser = msg.user.toLowerCase() === currentUser.toLowerCase();
          const userColor = userColorsRef.current[msg.user] || "#c5cae9";
          const bubbleColor = isCurrentUser ? "#e1f5fe" : userColor;
          const avatarColor = isCurrentUser ? "#1976d2" : userColor;

          return (
            <div
              key={`${msg.timestamp}-${i}`}
              style={{
                display: "flex",
                justifyContent: isCurrentUser ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: isCurrentUser ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  gap: "8px",
                  maxWidth: "85%",
                }}
              >
                <div
                  aria-hidden
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: avatarColor,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    flexShrink: 0,
                  }}
                >
                  {getInitial(msg.user)}
                </div>
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "16px",
                    backgroundColor: bubbleColor,
                    alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                    maxWidth: "100%",
                    wordBreak: "break-word",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    textAlign: isCurrentUser ? "right" : "left",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1a237e" }}>
                    {msg.user}
                  </span>
                  <span style={{ color: "#212121" }}>{msg.text}</span>
                  <span style={{ fontSize: "0.75rem", color: "#424242" }}>
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={t("groupChat.placeholder")}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 20px",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "#1976d2",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {t("groupChat.sendButton")}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
