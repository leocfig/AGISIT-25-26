import i18n from "i18next";

export function formatTimestamp(ts: string) {
  const date = new Date(ts);
  const now = new Date();

  const diff = now.getTime() - date.getTime();
  const oneDay = 1000 * 60 * 60 * 24;

  const locale = i18n.language || navigator.language;

  // If it's today, only shows the time
  if (now.toDateString() === date.toDateString()) {
    return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  }

  // If it's yesterday, it shows "yesterday"
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === date.toDateString()) {
    return i18n.t("time.yesterday");
  }

  // Last 7 days
  if (diff < 7 * oneDay) {
    return date.toLocaleDateString(locale, { weekday: "long" });
  }

  // Otherwise, shows the day
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
