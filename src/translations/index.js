import ptBr from './pt-br/index';
import enGb from './en-gb/index';
import en from './en/index';
import esPy from './es-py/index';

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

