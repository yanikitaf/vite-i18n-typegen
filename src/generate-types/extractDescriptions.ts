import { flattenObject } from './translationParser/flattenObject.js';

export const extractDescriptions = (
  translations: Record<string, Record<string, any>>[],
  langs: string[],
): Record<string, Record<string, string>> => {
  const result: Record<string, Record<string, string>> = {};

  langs.forEach((lang, index) => {
    const translation = translations[index];
    if (!translation) return;

    const flattened = flattenObject(translation);
    for (const key in flattened) {
      if (!result[key]) result[key] = {};
      result[key][lang] = getRawValue(translations[index], key);
    }
  });

  return result;
};

// Утилита для получения строки по пути "a.b.c"
const getRawValue = (obj: any, path: string): string => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? '';
};
