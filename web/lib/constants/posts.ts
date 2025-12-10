export const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  soru: { label: "Soru", emoji: "❓", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  yedek_parca: { label: "Yedek Parça", emoji: "🔧", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  servis: { label: "Servis", emoji: "🛠️", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  bakim: { label: "Bakım", emoji: "⚙️", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  deneyim: { label: "Deneyim", emoji: "💬", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
  yardim: { label: "Yardım", emoji: "🤝", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  anket: { label: "Anket", emoji: "📊", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
};

export const CATEGORIES = [
  { value: "soru", label: "Soru", emoji: "❓" },
  { value: "yedek_parca", label: "Yedek Parça", emoji: "🔧" },
  { value: "servis", label: "Servis", emoji: "🛠️" },
  { value: "bakim", label: "Bakım", emoji: "⚙️" },
  { value: "deneyim", label: "Deneyim", emoji: "💬" },
  { value: "yardim", label: "Yardım", emoji: "🤝" },
  { value: "anket", label: "Anket", emoji: "📊" },
];

export const BADGE_INFO: Record<string, { name: string; emoji: string }> = {
  bronze: { name: "Bronz", emoji: "🥉" },
  silver: { name: "Gümüş", emoji: "🥈" },
  gold: { name: "Altın", emoji: "🥇" },
  platinum: { name: "Platin", emoji: "💎" },
  diamond: { name: "Elmas", emoji: "💠" },
};
