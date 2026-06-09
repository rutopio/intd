import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import en from "@/locales/en.json"
import zh from "@/locales/zh.json"

// The URL is the source of truth for language (zh = bare path, en = /en prefix);
// the language detector is intentionally omitted. changeLanguage is driven by the
// route on entry. zh maps to the existing zh_tw content.
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: "zh",
  fallbackLng: "zh",
  interpolation: { escapeValue: false },
})

export default i18n
