import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationEN from './locales/en/translation.json';
import translationHI from './locales/hi/translation.json';
import translationTA from './locales/ta/translation.json';
import translationOR from './locales/or/translation.json';
import translationBN from './locales/bn/translation.json';
import translationGU from './locales/gu/translation.json';
import translationMR from './locales/mr/translation.json';

const resources = {
    en: { translation: translationEN },
    hi: { translation: translationHI },
    ta: { translation: translationTA },
    or: { translation: translationOR },
    bn: { translation: translationBN },
    gu: { translation: translationGU },
    mr: { translation: translationMR },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: true, // Enable debug for development
        interpolation: {
            escapeValue: false, // React already safes from XSS
        },
        detection: {
            order: ['queryString', 'cookie', 'localStorage', 'navigator'],
            caches: ['localStorage', 'cookie'],
        },
    });

export default i18n;
