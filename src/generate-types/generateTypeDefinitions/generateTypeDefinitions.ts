import type { Config } from '../../types.js';

type TranslationDescriptions = Record<string, Record<string, string>>;

const createParamType = (params: string[]): string => {
  const uniqueParams = [...new Set(params)];
  return uniqueParams.length > 0
    ? `{ ${uniqueParams.map((p) => `${p}: string | number | Date`).join('; ')} }`
    : 'undefined';
};

const generateJsDoc = (
  key: string,
  langs: Record<string, string>,
  preferredLangOrder: string[],
): string => {
  if (!langs || Object.keys(langs).length === 0) {
    return `  /** No translations found for key: ${key} */`;
  }

  const allEntries = [
    ...preferredLangOrder
      .filter((lang) => langs[lang])
      .map((lang) => [lang, langs[lang]] as [string, string]),
    ...Object.entries(langs).filter(
      ([lang]) => !preferredLangOrder.includes(lang),
    ),
  ];

  const escapeBraces = (text: string) =>
    text.replace(/{/g, '{{').replace(/}/g, '}}');

  const previewLine = allEntries.map(([_, v]) => escapeBraces(v)).join(' / ');

  const columnSizes = allEntries.reduce(
    (acc, [lang, text]) => ({
      lang: Math.max(acc.lang, lang.length),
      text: Math.max(acc.text, escapeBraces(text).length),
    }),
    { lang: 4, text: 11 },
  );

  const header = `| ${'lang'.padEnd(columnSizes.lang)} | ${'translation'.padEnd(columnSizes.text)} |`;
  const divider = `| ${'-'.repeat(columnSizes.lang)} | ${'-'.repeat(columnSizes.text)} |`;
  const rows = allEntries.map(
    ([lang, text]) =>
      `| ${lang.padEnd(columnSizes.lang)} | ${escapeBraces(text).padEnd(columnSizes.text)} |`,
  );

  return [
    `  /**`,
    `   * ${previewLine}`,
    `   *`,
    `   * @translations`,
    `   * ${header}`,
    `   * ${divider}`,
    ...rows.map((line) => `   * ${line}`),
    `   */`,
  ].join('\n');
};

const generateTranslationKeys = (
  keyParamsMap: Record<string, string[]>,
): string => {
  const keys = Object.keys(keyParamsMap);

  if (keys.length === 0) {
    return '';
  }

  if (keys.length === 1) {
    return `export type TranslationKeys = "${keys[0]}"`;
  }

  const keyStrings = keys.map((key) => `| "${key}"`);
  const keyString = keyStrings.join('\n');

  return `export type TranslationKeys = \n${keyString};`;
};

const generateTranslationParamsMap = (
  keyParamsMap: Record<string, string[]>,
): string => {
  const paramDefinitions = Object.entries(keyParamsMap)
    .map(([key, params]) => {
      const paramType = createParamType(params);
      return `  "${key}": ${paramType};`;
    })
    .join('\n');

  if (!paramDefinitions) {
    return '';
  }

  return `export type TranslationParamsMap = {\n${paramDefinitions}\n};`;
};

const generateTranslateFunctionDocs = (
  keyParamsMap: Record<string, string[]>,
  descriptions: TranslationDescriptions,
  preferredLangOrder: string[],
): string => {
  const functionDocs = Object.entries(keyParamsMap)
    .map(([key, params]) => {
      const hasParams = params.length > 0;
      const paramType = hasParams ? createParamType(params) : 'undefined';
      const jsDoc = descriptions[key]
        ? generateJsDoc(key, descriptions[key], preferredLangOrder)
        : `/** Missing translations for key: ${key} */`;
      return `${jsDoc}\n(key: "${key}"${hasParams ? `, params: ${paramType}` : ''}): string;`;
    })
    .join('\n\r');

  return `export interface TranslateFunctionDocs {\n${functionDocs}\n}`;
};

export const generateTypeDefinitions = (
  keyParamsMap: Record<string, string[]>,
  descriptions: TranslationDescriptions,
  config: Config,
): string => {
  if (Object.keys(keyParamsMap).length === 0) {
    throw new Error(`No translation keys found}`);
  }

  const typeDefinitions = [];

  if (config.generateKeys) {
    typeDefinitions.push(generateTranslationKeys(keyParamsMap));
  }

  if (config.generateParams) {
    typeDefinitions.push(generateTranslationParamsMap(keyParamsMap));
  }

  if (config.generateDocs) {
    typeDefinitions.push(
      generateTranslateFunctionDocs(
        keyParamsMap,
        descriptions,
        config.preferredLangOrder ?? [],
      ),
    );
  }

  return typeDefinitions.join('\n\r');
};
