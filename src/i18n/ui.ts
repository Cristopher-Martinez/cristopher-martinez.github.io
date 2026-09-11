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
      'Senior full-stack engineer, four years in payments infrastructure: bulk dispersals, reversals, webhook integrations and reconciliation. Also video platforms and AI developer tooling.',
    'site.role': 'Senior full-stack engineer',
    'nav.home': 'Home',
    'nav.primary': 'Primary',
    'nav.work': 'Work',
    'nav.log': 'Engineering log',
    'nav.about': 'About',
    'lang.switch': 'Ver en español',
    'theme.toggle': 'Switch colour theme',
    'skip.content': 'Skip to content',
    'live.label': 'Live',
    'home.eyebrow': 'Payments · Full-stack · AI',
    'home.current': 'Payments infrastructure at LoopPay · since 2022',
    'home.pitch':
      'Four years building payments infrastructure: money in, money out, and the reconciliation that has to balance. On my own time I split a video platform into contract-bound capabilities and built the AI tooling that develops it.',
    'work.files': 'files',
    'work.deps': 'runtime deps',
    'work.tests': 'tests',
    'work.source': 'source',
    'work.back': 'All work',
    'log.outcome': 'Outcome',
    'log.back': 'All entries',
    'log.title': 'Engineering log',
    'log.intro': 'Problem, constraint, what I discarded, the decision, and the measured result. Including the entries where something broke.',
    'about.title': 'About',
    'exp.title': 'Experience',
  },
  es: {
    'site.title': 'Cristopher Martinez — Ingeniero Full-Stack Senior',
    'site.description':
      'Ingeniero full-stack senior, cuatro años en infraestructura de pagos: dispersiones masivas, reversiones, integración de webhooks y conciliación. También plataformas de video y herramientas de IA.',
    'site.role': 'Ingeniero full-stack senior',
    'nav.home': 'Inicio',
    'nav.primary': 'Principal',
    'nav.work': 'Trabajo',
    'nav.log': 'Bitácora',
    'nav.about': 'Perfil',
    'lang.switch': 'View in English',
    'theme.toggle': 'Cambiar el tema de color',
    'skip.content': 'Saltar al contenido',
    'live.label': 'En vivo',
    'home.eyebrow': 'Pagos · Full-stack · IA',
    'home.current': 'Infraestructura de pagos en LoopPay · desde 2022',
    'home.pitch':
      'Cuatro años construyendo infraestructura de pagos: dinero que entra, dinero que sale, y la conciliación que tiene que cerrar. Fuera del horario separé una plataforma de video en capacidades con contratos y construí el tooling de IA que la desarrolla.',
    'work.files': 'archivos',
    'work.deps': 'dependencias',
    'work.tests': 'tests',
    'work.source': 'código',
    'work.back': 'Todo el trabajo',
    'log.outcome': 'Resultado',
    'log.back': 'Todas las entradas',
    'log.title': 'Bitácora de ingeniería',
    'log.intro': 'Problema, restricción, lo que descarté, la decisión y el resultado medido. Incluidas las entradas donde algo se rompió.',
    'about.title': 'Perfil',
    'exp.title': 'Experiencia',
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
