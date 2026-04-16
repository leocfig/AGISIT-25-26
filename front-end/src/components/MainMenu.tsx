import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageModifier from "./LanguageModifier";
import AddFriendModal from "./friends/AddFriendModal";
import CreateDMModal from "./messaging/CreateDMModal";
import CreateGroupChatModal from "./messaging/CreateGroupChatModal";
import {
  fetchGroupChats,
  fetchDirectMessages,
  createGroupChat,
  createDirectMessage,
  addNewFriend,
  fetchFriends,
  removeFriend,
} from "../api/messaging";
import { toast } from "react-toastify";
import Sidebar from "./layout/SideBar";
import AllFriends from "./friends/AllFriends";
import OnlineFriends from "./friends/OnlineFriends";
import SearchBox from "./layout/SearchBox";
import WelcomeMessage from "./layout/WelcomeMessage";
import DirectMessages from "./messaging/DirectMessages";
import GroupChats from "./messaging/GroupChats";
import CreateChatButtons from "./messaging/CreateChatButtons";
import type { Friend, GroupChat } from "./types";

interface MainMenuProps {
  token: string | null;
  onSelect: (chat: { id: string; name: string; isGroup?: boolean }) => void;
  userName: string;
  onLogout: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ token, onSelect, userName, onLogout }) => {
  const { t } = useTranslation();
  const [directMessages, setDirectMessages] = useState<GroupChat[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [isDMModalOpen, setIsDMModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Load chats, DMs, and friends
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const [dms, groups, friendsList] = await Promise.all([
          fetchDirectMessages(token),
          fetchGroupChats(token),
          fetchFriends(token),
        ]);
        setDirectMessages(dms);
        setGroupChats(groups);
        setFriends(friendsList);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    loadData();
  }, [token]);

  const handleCreateDirectMessage = async (friendUsername: string) => {
    if (!friendUsername.trim() || !token) return;
    try {
      const created = await createDirectMessage(token, friendUsername);
      setDirectMessages((prev) => [...prev, created]);
      onSelect({ id: created.public_id, name: created.name });
    } catch (err: any) {
      const errors = err.response?.data;
      if (errors) {
        const messages = Object.values(errors).flat();
        toast.error(String(messages[0]));
      } else {
        toast.error("Error creating DM!");
      }
    }
  };

  const handleCreateGroupChat = async (
    groupName: string,
    selectedMembers: string[]
  ) => {
    if (!groupName.trim() || !token) return;
    try {
      const created = await createGroupChat(token, groupName, selectedMembers);
      setGroupChats((prev) => [...prev, created]);
      onSelect({ id: created.public_id, name: created.name });
      setIsGroupModalOpen(false);
    } catch (err: any) {
      const errors = err.response?.data;
      if (errors) {
        const messages = Object.values(errors).flat();
        toast.error(String(messages[0]));
      } else {
        toast.error("Error creating Group Chat!");
      }
    }
  };

  const handleAddNewFriend = async (friendUsername: string) => {
    if (!token || !friendUsername.trim()) return;
    if (friendUsername === userName) {
      toast.error(t("friends.cannotAddSelf"));
      return;
    }
    try {
      const newFriend = await addNewFriend(token, friendUsername);
      setFriends((prev) => [...prev, { ...newFriend, online: true }]);
      toast.success(t("friends.success", { name: friendUsername }));
    } catch (err: any) {
      const errors = err.response?.data;
      if (errors) {
        const messages = Object.values(errors).flat();
        toast.error(String(messages[0]));
      } else {
        toast.error("Error adding friend!");
      }
    }
  };

  const handleRemoveFriend = async (friendUsername: string) => {
    if (!token) return;

    console.log(friendUsername)

    try {
      await removeFriend(token, friendUsername);
      setFriends((prev) => prev.filter((f) => f.username !== friendUsername));
      toast.success(t("Friend Removed", { name: friendUsername }));
    } catch (err: any) {
      const message = err.response?.data?.error || "Error removing friend!";
      toast.error(message);
    }
  };

  const fetchChats = async () => {
  if (!token) return;
  try {
    const [dms, groups] = await Promise.all([
      fetchDirectMessages(token),
      fetchGroupChats(token),
    ]);
    setDirectMessages(dms);
    setGroupChats(groups);
  } catch (err) {
    console.error("Error fetching chats:", err);
  }
};

  return (
    <div className="flex p-6 gap-6 h-screen">
      <LanguageModifier />
      <Sidebar onLogout={onLogout} />

      <div className="flex-1 flex flex-col gap-6">
        <WelcomeMessage userName={userName} />
        <SearchBox />
        <OnlineFriends friends={friends} token={token} userName={userName} />
        <AllFriends
          friends={friends}
          onAddFriend={() => setIsFriendModalOpen(true)}
          onRemoveFriend={(friendUsername:string) => handleRemoveFriend(friendUsername)}
          onCreateDM={handleCreateDirectMessage}
        />
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <DirectMessages chats={directMessages} onSelect={onSelect} token={token} fetchChats={fetchChats}/>
        <GroupChats chats={groupChats} onSelect={onSelect} token={token}/>
        <CreateChatButtons
          onOpenDMModal={() => setIsDMModalOpen(true)}
          onOpenGroupModal={() => setIsGroupModalOpen(true)}
        />
      </div>

      {/* Modals */}
      {isFriendModalOpen && (
        <AddFriendModal
          isOpen={isFriendModalOpen}
          onClose={() => setIsFriendModalOpen(false)}
          onSubmit={handleAddNewFriend}
        />
      )}

      {isDMModalOpen && (
        <CreateDMModal
          isOpen={isDMModalOpen}
          friends={friends}
          onClose={() => setIsDMModalOpen(false)}
          onSubmit={handleCreateDirectMessage}
        />
      )}

      {isGroupModalOpen && (
        <CreateGroupChatModal
          isOpen={isGroupModalOpen}
          friends={friends}
          onClose={() => setIsGroupModalOpen(false)}
          onSubmit={handleCreateGroupChat}
        />
      )}
    </div>
  );
};

export default MainMenu;
