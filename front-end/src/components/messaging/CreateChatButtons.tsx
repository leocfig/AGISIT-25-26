// CreateChatButtons.tsx
import React from "react";
import { useTranslation } from "react-i18next";

interface CreateChatButtonsProps {
  onOpenDMModal: () => void;
  onOpenGroupModal: () => void;
}

const CreateChatButtons: React.FC<CreateChatButtonsProps> = ({ onOpenDMModal, onOpenGroupModal }) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-4">
      <button
        onClick={onOpenDMModal}
        className="flex-1 bg-green-600 text-white font-bold p-3 rounded-2xl hover:bg-green-500 cursor-pointer duration-150"
      >
        {t("selectMessages.newDirectButton")}
      </button>
      <button
        onClick={onOpenGroupModal}
        className="flex-1 bg-indigo-600 text-white font-bold p-3 rounded-2xl hover:bg-indigo-500 cursor-pointer duration-150"
      >
        {t("selectMessages.newGroupButton")}
      </button>
    </div>
  );
};

export default CreateChatButtons;
