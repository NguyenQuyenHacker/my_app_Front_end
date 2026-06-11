import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const [hasToken, setHasToken] = useState(() => !!getClientToken());
  const queryClient = useQueryClient();

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem("client.theme");
  }, [language]);

  useEffect(() => {
    const onAuthChanged = () => {
      const tokenNow = !!getClientToken();
      setHasToken(tokenNow);
      if (tokenNow) {
        // Vừa login → refetch preferences mới
        queryClient.invalidateQueries({ queryKey: ["preferences"] });
      } else {
        // Vừa logout → xóa cache, KHÔNG refetch (tránh gọi API khi đã hết token → 401)
        queryClient.removeQueries({ queryKey: ["preferences"] });
      }
    };
    window.addEventListener("client-auth-changed", onAuthChanged);
    return () => window.removeEventListener("client-auth-changed", onAuthChanged);
  }, [queryClient]);

  const { data: prefs } = useQuery({
    queryKey: ["preferences"],
    queryFn: getPreferences,
    enabled: hasToken,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (prefs?.language && SUPPORTED_LANGS.includes(prefs.language)) {
      setLanguageState(prefs.language);
      localStorage.setItem(STORAGE_LANG, prefs.language);
    }
  }, [prefs?.language]);

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
