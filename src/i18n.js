import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import { API } from "./types";

i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
        lng: localStorage.getItem('user-language') || "English",
        fallbackLng: "English",
        backend: {
            loadPath: `${API}/locales/{{lng}}`,
        },
        interpolation: {
            escapeValue: false // react already safes from xss
        },
        // Debugging during dev
        debug: true,
        // Wait for translations to load
        react: {
            useSuspense: true,
        }
    });

export default i18n;
