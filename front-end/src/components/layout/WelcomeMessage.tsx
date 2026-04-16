// WelcomeMessage.tsx
import React from "react";
import { useTranslation } from "react-i18next";

interface WelcomeMessageProps {
  userName: string;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ userName }) => {
  const { t } = useTranslation();

  return (
    <div className="text-white text-2xl font-bold mb-2">
      {t("selectMessages.welcome")}, <span className="font-extrabold">{userName}</span>!
    </div>
  );
};

export default WelcomeMessage;
