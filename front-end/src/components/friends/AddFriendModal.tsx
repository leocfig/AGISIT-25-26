import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (friendName: string) => void;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [friendName, setFriendName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!friendName.trim()) return;
    onSubmit(friendName);
    setFriendName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-80 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-500 hover:text-red-600"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Friend</h2>

        <input
          type="text"
          value={friendName}
          onChange={(e) => setFriendName(e.target.value)}
          placeholder={t("friends.addFriendPlaceholder")}
          className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-400 transition-colors"
        >
          {t("friends.addFriendButton")}
        </button>
      </div>
    </div>
  );
};

export default AddFriendModal;
