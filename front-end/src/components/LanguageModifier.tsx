import i18n from "i18next";
import ReactCountryFlag from "react-country-flag";

export default function LanguageModifier() {
  const toggleLanguage = () => {
    const newLanguage = i18n.language === "en" ? "pt" : "en";
    i18n.changeLanguage(newLanguage);
  };

  const flagCode = i18n.language === "en" ? "GB" : "PT";

  return (
    <button
      onClick={toggleLanguage}
      className="absolute top-5 right-5 flex items-center gap-3 bg-gray-700 text-white font-semibold px-5 py-3 rounded hover:bg-gray-600"
    >
      <ReactCountryFlag countryCode={flagCode} svg style={{ width: '1.5em', height: '1.5em' }} />
      {i18n.language.toUpperCase()}
    </button>
  );
}
