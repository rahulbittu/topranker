/**
 * i18n React Integration — Sprint 121
 * React hooks and components wrapping the core i18n module.
 * Owner: Priya Sharma (Frontend)
 */

import { useState, useCallback } from "react";
import { Text } from "react-native";
import React from "react";
import { t, getLocale, setLocale as setCoreLocale, type Locale } from "./i18n";

/**
 * React hook for translation access.
 * Returns the translate function, current locale, and a locale setter.
 */
export function useTranslation(): {
  t: (key: string) => string;
  locale: Locale;
  setLocale: (l: Locale) => void;
} {
  const [locale, setLocaleState] = useState<Locale>(getLocale());

  const changeLocale = useCallback((l: Locale) => {
    setCoreLocale(l);
    setLocaleState(l);
  }, []);

  const translate = useCallback(
    (key: string) => t(key, locale),
    [locale]
  );

  return { t: translate, locale, setLocale: changeLocale };
}

/**
 * Component that renders translated text.
 * Accepts a translation key and optional style.
 */
export function TranslatedText({
  tKey,
  style,
}: {
  tKey: string;
  style?: any;
}): JSX.Element {
  const { t } = useTranslation();
  return React.createElement(Text, { style }, t(tKey));
}
