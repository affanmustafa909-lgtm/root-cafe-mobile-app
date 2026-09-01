import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { STORAGE_KEYS } from '../constants/config';
import de from './locales/de.json';
import en from './locales/en.json';

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    de: { translation: de },
    en: { translation: en },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export async function loadSavedLanguage() {
  const saved = await AsyncStorage.getItem(STORAGE_KEYS.language);
  if (saved === 'de' || saved === 'en') {
    await i18n.changeLanguage(saved);
  }
}

export async function setLanguage(lng: 'de' | 'en') {
  await AsyncStorage.setItem(STORAGE_KEYS.language, lng);
  await i18n.changeLanguage(lng);
}

export default i18n;
