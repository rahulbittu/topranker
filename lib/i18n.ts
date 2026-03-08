/**
 * Internationalization (i18n) Foundation — Sprint 118
 * In-memory translation dictionary with locale management.
 * Owner: Priya Sharma (Frontend)
 */

export type Locale = "en" | "es" | "fr";

export const DEFAULT_LOCALE: Locale = "en";

let currentLocale: Locale = DEFAULT_LOCALE;

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    home: "Home",
    search: "Search",
    profile: "Profile",
    settings: "Settings",
    sign_out: "Sign Out",
    sign_in: "Sign In",
    rankings: "Rankings",
    discover: "Discover",
    challenger: "Challenger",
    bookmarks: "Bookmarks",
    submit: "Submit",
    cancel: "Cancel",
  },
  es: {
    home: "Inicio",
    search: "Buscar",
    profile: "Perfil",
    settings: "Configuración",
    sign_out: "Cerrar Sesión",
    sign_in: "Iniciar Sesión",
    rankings: "Clasificaciones",
    discover: "Descubrir",
    challenger: "Retador",
    bookmarks: "Marcadores",
    submit: "Enviar",
    cancel: "Cancelar",
  },
  fr: {
    home: "Accueil",
    search: "Rechercher",
    profile: "Profil",
    settings: "Paramètres",
    sign_out: "Se Déconnecter",
    sign_in: "Se Connecter",
    rankings: "Classements",
    discover: "Découvrir",
    challenger: "Challenger",
    bookmarks: "Signets",
    submit: "Soumettre",
    cancel: "Annuler",
  },
};

/**
 * Translate a key using the given locale (or current locale).
 * Falls back to the key itself if no translation is found.
 */
export function t(key: string, locale?: Locale): string {
  const loc = locale || currentLocale;
  return translations[loc]?.[key] ?? key;
}

/**
 * Set the active locale.
 */
export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

/**
 * Get the current active locale.
 */
export function getLocale(): Locale {
  return currentLocale;
}
