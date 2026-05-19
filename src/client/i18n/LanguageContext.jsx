import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getPreferences, updatePreferences } from "../api/settingsApi";
import { getClientToken } from "../../utils/authUtils";
import { SUPPORTED_LANGS, getMessage } from "./translations";

const STORAGE_LANG = "client.language";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_LANG);
    return SUPPORTED_LANGS.includes(stored) ? stored : "vi";
  });

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
    // Clean up legacy theme attribute set by old ThemeContext
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem("client.theme");
  }, [language]);

  useEffect(() => {
    let cancelled = false;

    const syncFromServer = async () => {
      if (!getClientToken()) return;
      try {
        const data = await getPreferences();
        if (cancelled) return;
        if (data?.language && SUPPORTED_LANGS.includes(data.language)) {
          setLanguageState(data.language);
          localStorage.setItem(STORAGE_LANG, data.language);
        }
      } catch {
        // ignore
      }
    };

    syncFromServer();
    window.addEventListener("client-auth-changed", syncFromServer);

    return () => {
      cancelled = true;
      window.removeEventListener("client-auth-changed", syncFromServer);
    };
  }, []);

  const setLanguage = useCallback((value) => {
    if (!SUPPORTED_LANGS.includes(value)) return;
    setLanguageState(value);
    localStorage.setItem(STORAGE_LANG, value);
    updatePreferences({ language: value }).catch(() => {});
  }, []);

  const t = useCallback(
    (key) => getMessage(language, key),
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}

export function useT() {
  return useLanguage().t;
}
