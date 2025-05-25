import { describe, test, expect } from 'vitest';
import { generateTypeDefinitions } from './generateTypeDefinitions';

describe('generateTypeDefinitions', () => {
  test('Генерирует корректные типы и документацию', () => {
    const keyParamsMap = {
      'common.welcome': [],
      'products.cart.items': ['count'],
      'mixed.params': ['id', 'total'],
    };

    const descriptions = {
      'common.welcome': {
        en: 'Welcome!',
        ru: 'Добро пожаловать!',
      },
      'products.cart.items': {
        en: '{count} items',
        ru: '{count} товаров',
      },
      'mixed.params': {
        en: 'ID: {id}, Total: {total}',
        de: 'ID: {id}',
      },
    };

    const result = generateTypeDefinitions(keyParamsMap, descriptions, [
      'ru',
      'en',
    ]);

    // Проверка TranslationKeys
    expect(result).toMatch(
      /export type TranslationKeys =\n  \| "common\.welcome"/,
    );
    expect(result).toMatch(/\| "products\.cart\.items"/);

    // Проверка TranslationParamsMap
    expect(result).toMatch(/"common\.welcome": undefined/);
    expect(result).toMatch(
      /"products\.cart\.items": { count: string \| number \| Date }/,
    );

    // Проверка порядка языков
    // expect(result).toMatch(
    //   /\| ru\s+\| Добро пожаловать!\s+\|\n\s+\| en\s+\| Welcome!/,
    // );

    // Проверка параметров из разных языков
    expect(result).toMatch(
      /{ id: string \| number \| Date; total: string \| number \| Date }/,
    );

    // Проверка экранирования
    expect(result).toMatch(/{{count}}/);

    // Проверка форматирования таблицы
    expect(result).toMatch(
      /@translations\n\s+\* \| lang\s+\| translation\s+\|/,
    );
  });

  test('Соблюдает порядок языков согласно preferredLangOrder', () => {
    const keyParamsMap = { 'test.key': [] };
    const descriptions = {
      'test.key': {
        de: 'German',
        fr: 'French',
        ru: 'Russian',
        en: 'English',
      },
    };

    const result = generateTypeDefinitions(keyParamsMap, descriptions, [
      'fr',
      'de',
    ]);

    const expectedOrder = [
      'fr     | French',
      'de     | German',
      'en     | English',
      'ru     | Russian',
    ].join('\n');

    expect(result).toMatch(new RegExp(expectedOrder));
  });

  test('Объединяет параметры из всех языков', () => {
    const keyParamsMap = { 'test.key': ['count'] };
    const descriptions = {
      'test.key': {
        en: '{count} {total}',
        ru: '{count}',
      },
    };

    const result = generateTypeDefinitions(keyParamsMap, descriptions);
    expect(result).toMatchSnapshot();
    expect(result).toMatch(/{ count: string \| number \| Date }/);
    // expect(result).not.toMatch(/total/);
  });

  test('Выбрасывает ошибку при отсутствии ключей', () => {
    expect(() => generateTypeDefinitions({}, {})).toThrow(
      'No translation keys found',
    );
  });

  test('Корректно обрабатывает отсутствующие описания', () => {
    const keyParamsMap = { 'missing.key': ['param'] };
    const result = generateTypeDefinitions(keyParamsMap, {});

    expect(result).toContain(
      '/** Missing translations for key: missing.key */',
    );
    expect(result).toMatch(/params: { param: string \| number \| Date }/);
  });

  test('Форматирует таблицу с разными длинами текста', () => {
    const keyParamsMap = { 'long.key': [] };
    const descriptions = {
      'long.key': {
        en: 'Very long translation text',
        ru: 'Очень длинный текст перевода',
      },
    };

    const result = generateTypeDefinitions(keyParamsMap, descriptions);
    expect(result).toContain('| en   | Very long translation text   |');
    expect(result).toContain('| ru   | Очень длинный текст перевода |');
  });

  test('Snapshot: полная структура', () => {
    const keyParamsMap = {
      'common.welcome': [],
      'products.cart.items': ['count'],
    };

    const descriptions = {
      'common.welcome': {
        en: 'Welcome!',
        ru: 'Добро пожаловать!',
      },
      'products.cart.items': {
        en: '{count} items',
        ru: '{count} товаров',
      },
    };

    const result = generateTypeDefinitions(keyParamsMap, descriptions);
    expect(result).toMatchSnapshot();
  });
});
