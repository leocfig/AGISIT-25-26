// Sidebar.tsx
import React, { useMemo } from "react";
import { LogOut, UserRound } from "lucide-react";

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const username = useMemo(() => {
    const stored = sessionStorage.getItem("username");
    if (!stored || stored === "undefined" || stored === "null") {
      return "Unknown user";
    }
    return stored;
  }, []);

  return (
    <div className="bg-gray-700 p-4 rounded-2xl w-20 h-full flex flex-col items-center justify-between">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-600 text-white"
        title={username}
        aria-label={`Current user: ${username}`}
      >
        <UserRound size={28} />
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-400 transition-colors"
        aria-label="Log out"
        title="Log out"
      >
        <LogOut size={22} />
      </button>
    </div>
  );
};

export default Sidebar;
