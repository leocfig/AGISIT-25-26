import React from "react";
import { FaUserPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface AddFriendButtonProps {
  onClick: () => void;
}

// FIXME - Tooltip

const AddFriendButton: React.FC<AddFriendButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();
  const tooltipText = t("friends.addFriendTooltip");

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="
          w-14 h-14 
          bg-blue-400 
          text-white 
          rounded-full 
          flex items-center justify-center 
          shadow-lg 
          transform transition-transform duration-200
          hover:-translate-y-2 hover:scale-110
          hover:bg-blue-300
          focus:outline-none
        "
      >
        <FaUserPlus size={24} />
      </button>

      {/* Tooltip */}
      <span className="
        absolute bottom-full mb-3 left-1/2 -translate-x-1/2
        bg-gray-900 text-white text-sm rounded-md px-3 py-1
        opacity-0 group-hover:opacity-100
        transition-all duration-300 ease-in-out
        whitespace-nowrap
        pointer-events-none
        shadow-lg
        z-50
      ">
        {tooltipText}
      </span>
    </div>
  );
};

export default AddFriendButton;
