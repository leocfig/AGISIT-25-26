import { useState } from "react";
import LoginForm from "./components/loginForm/LoginForm";
import MainMenu from "./components/MainMenu";
import ChatWindow from "./components/messaging/ChatWindow";
import { usePresence } from "./hook/usePresence";
import { useTranslation } from "react-i18next";

interface SelectedChat {
  id: string; // public_id
  name: string; // chat name
  isGroup?: boolean;
}

function App() {
  const { t } = useTranslation();
  const [token, setToken] = useState<string | null>(
    sessionStorage.getItem("access_token")
  );
  const currentUser = sessionStorage.getItem("username") || "";
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);

  const handleLogOut = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  // Show login form if not logged in
  usePresence(token,currentUser);

  if (!token) {
    return (
      <div className="bg-gray-900 h-screen flex justify-center items-center">
        <LoginForm
          onLogin={(jwt, username) => {
            sessionStorage.setItem("access_token", jwt);
            if (username && username !== "undefined" && username !== "null") {
              sessionStorage.setItem("username", username);
            }
            setToken(jwt);
          }}
        />
      </div>
    );
  }

  // Show room selection if logged in but no room selected
  if (!selectedChat) {
    return (
      <div className="bg-gray-900 h-screen flex flex-col justify-center items-center">
        <MainMenu
          token={token}
          userName={currentUser}
          onSelect={setSelectedChat}
          onLogout={handleLogOut}
        />
      </div>
    );
  }

  // Show chat room if logged in and room selected
  return (
    <div className="bg-gray-900 h-screen p-4">
      <ChatWindow
        groupChatId={selectedChat.id}
        groupChatName={selectedChat.name}
        token={token}
        currentUser={currentUser}
        isGroup={selectedChat.isGroup}
      />

      <div className="mt-4 flex items-center justify-center">
        <button
          className="bg-red-500 px-4 py-2 rounded-xl text-white border border-red-500 hover:bg-transparent duration-150 cursor-pointer"
          onClick={() => setSelectedChat(null)}
        >
          {t("groupChat.leaveChat")}
        </button>
      </div>
    </div>
  );
}
export default App;