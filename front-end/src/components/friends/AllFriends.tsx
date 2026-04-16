// AllFriends.tsx
import React from "react";
import { CircleMinus, CirclePlus, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Friend } from "../types";


interface AllFriendsProps {
  friends: Friend[];
  onAddFriend: () => void;
  onRemoveFriend: (friendUsername:string)=> void;
  onCreateDM: (username: string) => void;
}

const AllFriends: React.FC<AllFriendsProps> = ({ friends, onAddFriend, onRemoveFriend, onCreateDM }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-700 p-4 rounded-2xl flex-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold">{t("selectMessages.listFriends")}</h3>
        <button
          onClick={onAddFriend}
          className="w-8 h-8 flex items-center justify-center bg-teal-800 hover:bg-teal-950 text-white rounded-full text-xl font-bold cursor-pointer duration-150"
        >
          <CirclePlus/>
        </button>
      </div>

      {friends.map(f => (
        <div
          key={f.id}
          className="flex items-center justify-between bg-gray-600 p-3 rounded-2xl mb-3  duration-150 hover:bg-gray-500"
        >
          <span className="font-medium text-white">{f.username}</span>
          <div className="flex gap-2">
            <button
              onClick={() => onRemoveFriend(f.username)}
              className="bg-red-600 hover:bg-red-900 text-white p-2 rounded-full flex items-center justify-center cursor-pointer duration-150"
              title={t("friends.deleteFriendTooltip", { name: f.username })}
            >
              <CircleMinus size={16}  />
            </button>
            <button
              onClick={() => onCreateDM(f.username)}
              className="bg-teal-600 hover:bg-teal-900 text-white p-2 rounded-full flex items-center justify-center cursor-pointer duration-150"
              title={t("selectMessages.dmTooltip", { name: f.username })}
            >
              <Send size={16} strokeWidth={2} />
            </button>
            
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllFriends;
