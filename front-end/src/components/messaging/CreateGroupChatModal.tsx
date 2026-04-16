import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface CreateGroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: { id: number; username: string }[];
  onSubmit: (groupName: string, selectedMembers: string[]) => void;
}

const CreateGroupChatModal: React.FC<CreateGroupChatModalProps> = ({
  isOpen,
  onClose,
  friends,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");

  if (!isOpen) return null;

  const toggleFriend = (username: string) => {
    setSelectedFriends(prev =>
      prev.includes(username)
        ? prev.filter(f => f !== username)
        : [...prev, username]
    );
  };

  const handleSubmit = () => {
    if (groupName.trim() && selectedFriends.length > 0) {
      onSubmit(groupName, selectedFriends);
      setGroupName("");
      setSelectedFriends([]);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-80 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t("groupChat.createTitle")}</h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>

        {/* Group Name */}
        <input
          type="text"
          placeholder={t("groupChat.namePlaceholder")}
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          className="w-full p-2 rounded border mb-4"
        />

        {/* Friends List */}
        <div className="max-h-60 overflow-y-auto mb-4">
          {friends.map(f => (
            <div
              key={f.id}
              className={`flex justify-between items-center p-2 rounded cursor-pointer ${
                selectedFriends.includes(f.username) ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
              onClick={() => toggleFriend(f.username)}
            >
              <span>{f.username}</span>
              <span
                className={`px-3 py-1 rounded ${
                  selectedFriends.includes(f.username)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                }`}
              >
                {selectedFriends.includes(f.username)
                  ? t("groupChat.selected")
                  : t("groupChat.select")}
              </span>
            </div>
          ))}
        </div>

        {/* Create Button */}
        <button
          onClick={handleSubmit}
          disabled={!groupName.trim() || selectedFriends.length === 0}
          className={`w-full py-2 rounded ${
            groupName.trim() && selectedFriends.length > 0
              ? "bg-green-600 text-white hover:bg-green-500"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          {t("groupChat.createButton")}
        </button>
      </div>
    </div>
  );
};

export default CreateGroupChatModal;
