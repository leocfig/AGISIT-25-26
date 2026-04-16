import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface CreateDMModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: { id: number; username: string }[];
  onSubmit: (friendUsername: string) => void;
  isAddToGroup?: boolean;
}

const CreateDMModal: React.FC<CreateDMModalProps> = ({
  isOpen,
  onClose,
  friends,
  onSubmit,
  isAddToGroup,
}) => {
  const { t } = useTranslation();
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-80 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {t("directMessages.chooseFriend")}
          </h2>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Friends List */}
        <div className="max-h-60 overflow-y-auto mb-4">
          {friends.length === 0 ? (
            <p className="text-gray-500 text-sm">
              {t("directMessages.emptyFriendsList")}
            </p>
          ) : (
            friends.map((friend) => {
              const key = friend.id ?? `friend-${friend.username}`;

              return (
                <div
                  key={key}
                  className={`flex justify-between items-center p-2 rounded cursor-pointer ${
                    selectedFriend === friend.username
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    setSelectedFriend((prev) =>
                      prev === friend.username ? null : friend.username
                    )
                  }
                >
                  <span>{friend.username}</span>
                  <button
                    className={`px-3 py-1 rounded ${
                      selectedFriend === friend.username
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    }`}
                  >
                    {selectedFriend === friend.username
                      ? t("directMessages.friendSelected")
                      : t("directMessages.friendSelect")}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Create Button */}
        <button
          onClick={() => selectedFriend && onSubmit(selectedFriend)}
          disabled={!selectedFriend}
          className={`w-full py-2 rounded ${
            selectedFriend
              ? "bg-green-600 text-white hover:bg-green-500"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          {isAddToGroup ? (
            <div>{t("groupChat.addToGroup")}</div>
          ) : (
            <div>{t("directMessages.newDirectMessage")}</div>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateDMModal;
