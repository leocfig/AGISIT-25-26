// SearchBox.tsx
import React from "react";
import { useTranslation } from "react-i18next";

const SearchBox: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-700 p-4 rounded-2xl">
      <input
        type="text"
        placeholder={t("selectMessages.searchPlaceholder")}
        className="w-full p-3 rounded-xl bg-gray-600 text-white outline-none"
      />
    </div>
  );
};

export default SearchBox;