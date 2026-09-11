export const languages = {
  en: 'English',
  es: 'Español',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'en';

/** BCP 47 tags for `lang` attributes and hreflang annotations. */
export const localeTags: Record<Lang, string> = {
  en: 'en',
  es: 'es',
};

export const ui = {
  en: {
    'site.title': 'Cristopher Martinez — Senior Full-Stack Engineer',
    'site.description':
      'Full-stack engineer building video platforms, GPU infrastructure and AI developer tooling. Two products running in production.',
    'site.role': 'Senior full-stack engineer',
    'nav.work': 'Work',
    'nav.log': 'Engineering log',
    'nav.about': 'About',
    'lang.switch': 'Ver en español',
  },
  es: {
    'site.title': 'Cristopher Martinez — Ingeniero Full-Stack Senior',
    'site.description':
      'Ingeniero full-stack. Construyo plataformas de video, infraestructura de GPU y herramientas de IA para desarrollo. Dos productos en producción.',
    'site.role': 'Ingeniero full-stack senior',
    'nav.work': 'Proyectos',
    'nav.log': 'Bitácora',
    'nav.about': 'Perfil',
    'lang.switch': 'View in English',
  },
} as const satisfies Record<Lang, Record<string, string>>;

type UIKey = keyof (typeof ui)[typeof defaultLang];

/**
 * Returns a lookup bound to `lang`, falling back to the default language so a
 * missing translation renders real text instead of a raw key.
 */
export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return (ui[lang] as Record<string, string>)[key] ?? ui[defaultLang][key];
  };
}

/** Reads the locale out of a pathname; unprefixed paths are the default language. */
export function langFromPath(pathname: string): Lang {
  const segment = pathname.split('/').filter(Boolean)[0];
  return segment in languages ? (segment as Lang) : defaultLang;
}

/**
 * Strips the locale prefix, yielding the language-independent route.
 * `/es/work/` and `/work/` both become `/work/`.
 */
export function routeWithoutLang(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] in languages && segments[0] !== defaultLang) segments.shift();
  return '/' + segments.join('/') + (segments.length ? '/' : '');
}

/** Builds the path for `route` in `lang`. The default language carries no prefix. */
export function pathForLang(route: string, lang: Lang): string {
  const clean = route.startsWith('/') ? route : `/${route}`;
  return lang === defaultLang ? clean : `/${lang}${clean}`;
}
