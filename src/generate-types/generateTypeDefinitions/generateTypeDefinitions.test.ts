import { describe, test, expect } from 'vitest';
import { generateTypeDefinitions } from './generateTypeDefinitions';
import { DEFAULT_CONFIG } from '../loadConfig/constants';

describe('generateTypeDefinitions', () => {
  test('Генерирует корректные типы и документацию', () => {
    const keyParamsMap = {
      'common.welcome': [],
      'products.cart.items': ['count'],
      'mixed.params': ['id', 'total'],
    };

    const descriptions = {
      'common.welcome': {
        ru: 'Добро пожаловать!',
        en: 'Welcome!',
      },
      'products.cart.items': {
        ru: '{{count}} товаров',
        en: '{{count}} items',
      },
      'mixed.params': {
        en: 'ID: {{id}}, Total: {{total}}',
        de: 'ID: {{id}}',
      },
    };

    const result = generateTypeDefinitions(
      keyParamsMap,
      descriptions,
      DEFAULT_CONFIG,
    );

    // Check if all expected keys are present in the TranslationKeys type
    expect(result).toContain('export type TranslationKeys =');
    expect(result).toContain('"common.welcome"');
    expect(result).toContain('"products.cart.items"');
    expect(result).toContain('"mixed.params"');

    // Check if the generated params are correct
    expect(result).toContain('count: string | number | Date');
    expect(result).toContain('id: string | number | Date');
    expect(result).toContain('total: string | number | Date');
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

    const result = generateTypeDefinitions(keyParamsMap, descriptions, {
      ...DEFAULT_CONFIG,
      preferredLangOrder: ['fr', 'de'],
    });

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

    const result = generateTypeDefinitions(
      keyParamsMap,
      descriptions,
      DEFAULT_CONFIG,
    );
    expect(result).toMatchSnapshot();
    expect(result).toMatch(/{ count: string \| number \| Date }/);
    // expect(result).not.toMatch(/total/);
  });

  test('Выбрасывает ошибку при отсутствии ключей', () => {
    expect(() => generateTypeDefinitions({}, {}, DEFAULT_CONFIG)).toThrow(
      'No translation keys found',
    );
  });

  test('Корректно обрабатывает отсутствующие описания', () => {
    const keyParamsMap = { 'missing.key': ['param'] };
    const result = generateTypeDefinitions(keyParamsMap, {}, DEFAULT_CONFIG);

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

    const result = generateTypeDefinitions(
      keyParamsMap,
      descriptions,
      DEFAULT_CONFIG,
    );
    expect(result).toContain('| en   | Very long translation text   |');
    expect(result).toContain('| ru   | Очень длинный текст перевода |');
  });

  test('Snapshot: полная структура', () => {
    const keyParamsMap = {
      'common.welcome': [],
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

    const result = generateTypeDefinitions(
      keyParamsMap,
      descriptions,
      DEFAULT_CONFIG,
    );
    expect(result).toMatchSnapshot();
  });
});
