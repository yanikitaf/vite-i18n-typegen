type TranslationDescriptions = Record<string, Record<string, string>>;

export const generateTypeDefinitions = (
  keyParamsMap: Record<string, string[]>,
  descriptions: TranslationDescriptions,
  preferredLangOrder: string[] = ['ru', 'en'],
): string => {
  // 1. Добавлена проверка на пустые ключи
  if (Object.keys(keyParamsMap).length === 0) {
    throw new Error('No translation keys found');
  }

  const translationKeys = Object.keys(keyParamsMap)
    .map((key) => `  | "${key}"`)
    .join('\n');

  const paramsMap = Object.entries(keyParamsMap)
    .map(([key, params]) => {
      // 2. Упрощение получения уникальных параметров
      const uniqueParams = Array.from(new Set(params));
      return `  "${key}": ${
        uniqueParams.length > 0
          ? `{ ${uniqueParams.map((p) => `${p}: string | number | Date`).join('; ')} }`
          : 'undefined'
      };`;
    })
    .join('\n');

  const generateJsDoc = (
    key: string,
    langs: Record<string, string>,
  ): string => {
    // 3. Обработка отсутствующих переводов
    if (!langs || Object.keys(langs).length === 0) {
      return `  /** No translations found for key: ${key} */`;
    }

    // 4. Улучшенная сортировка языков
    const allEntries = [
      ...preferredLangOrder
        .map((lang) => (langs[lang] ? ([lang, langs[lang]] as const) : null))
        .filter(Boolean),
      ...Object.entries(langs).filter(
        ([lang]) => !preferredLangOrder.includes(lang),
      ),
    ] as Array<[string, string]>;

    // 5. Экранирование фигурных скобок для JSDoc
    const escapeBraces = (text: string) =>
      text.replace(/{/g, '{{').replace(/}/g, '}}');

    const previewLine = allEntries
      .slice(0, 2)
      .map(([_, v]) => escapeBraces(v))
      .join(' / ');

    // 6. Оптимизация расчета размеров колонок
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
      `  /**`,
      `   * ${previewLine}`,
      `   *`,
      `   * @translations`,
      `   * ${header}`,
      `   * ${divider}`,
      ...rows.map((line) => `   * ${line}`),
      `   */`,
    ].join('\n');
  };

  // 7. Улучшенная обработка параметров
  const functionDocs = Object.entries(keyParamsMap)
    .map(([key, params]) => {
      const uniqueParams = Array.from(new Set(params));
      const hasParams = uniqueParams.length > 0;

      const jsDoc = descriptions[key]
        ? generateJsDoc(key, descriptions[key])
        : `  /** Missing translations for key: ${key} */`;

      const paramType = hasParams
        ? `{ ${uniqueParams.map((p) => `${p}: string | number | Date`).join('; ')} }`
        : 'undefined';

      return `${jsDoc}\n  (key: "${key}"${hasParams ? `, params: ${paramType}` : ''}): string;`;
    })
    .join('\n\n');

  const translateFunctionDocs = `export interface TranslateFunctionDocs {\n${functionDocs}\n}`;

  // 8. Форматирование итоговой строки
  return [
    `export type TranslationKeys =`,
    translationKeys,
    `\nexport type TranslationParamsMap = {`,
    paramsMap,
    `}\n\n`,
    translateFunctionDocs,
  ].join('\n');
};
