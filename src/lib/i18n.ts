import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLangFromPath } from "@/lib/language";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";

// Route entry controls language; browser detection would disagree with shared URLs.
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: getLangFromPath(window.location.pathname),
  fallbackLng: "zh",
  interpolation: { escapeValue: false },
});

export default i18n;
