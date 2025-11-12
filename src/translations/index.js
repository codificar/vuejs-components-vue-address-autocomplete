import ptBr from './pt-br';
import enGb from './en-gb';
import en from './en';
import esPy from './es-py';

export const translations = {
  'pt-br': ptBr,
  'en-gb': enGb,
  'en': en,
  'es-py': esPy
};

export function getTranslation(locale, key) {
  const localeTranslations = translations[locale] || translations['pt-br'];
  return localeTranslations[key] || '';
}

