import { describe, it, expect } from 'vitest';
import { generateTypeDefinitions } from './generateTypeDefinitions.js';

describe('generateTypeDefinitions', () => {
  it('должен обрабатывать пустой ввод', () => {
    const result = generateTypeDefinitions({});
    const expected = `export type TranslationKeys =\n;\n\nexport type TranslationParamsMap = {\n\n};\n`;
    expect(result).toBe(expected);
  });

  it('следует обрабатывать один ключ с параметрами', () => {
    const result = generateTypeDefinitions({ key1: ['param1', 'param2'] });
    const expected = `export type TranslationKeys =\n  | "key1";\n\nexport type TranslationParamsMap = {\n  "key1": { param1: string; param2: string };\n};\n`;
    expect(result).toBe(expected);
  });

  it('следует обрабатывать несколько ключей с параметрами', () => {
    const result = generateTypeDefinitions({
      key1: ['param1'],
      key2: ['param2', 'param3'],
    });
    const expected = `export type TranslationKeys =\n  | "key1"\n  | "key2";\n\nexport type TranslationParamsMap = {\n  "key1": { param1: string };\n  "key2": { param2: string; param3: string };\n};\n`;
    expect(result).toBe(expected);
  });

  it('следует обрабатывать ключи с повторяющимися параметрами', () => {
    const result = generateTypeDefinitions({ key1: ['param1', 'param1'] });
    const expected = `export type TranslationKeys =\n  | "key1";\n\nexport type TranslationParamsMap = {\n  "key1": { param1: string };\n};\n`;
    expect(result).toBe(expected);
  });

  it('следует обрабатывать ключи без параметров', () => {
    const result = generateTypeDefinitions({ key1: [] });
    const expected = `export type TranslationKeys =\n  | "key1";\n\nexport type TranslationParamsMap = {\n  "key1": undefined;\n};\n`;
    expect(result).toBe(expected);
  });

  it('следует обрабатывать смешанные сценарии', () => {
    const result = generateTypeDefinitions({
      key1: [],
      key2: ['param1', 'param2', 'param2'],
      key3: ['param3'],
    });
    const expected = `export type TranslationKeys =\n  | "key1"\n  | "key2"\n  | "key3";\n\nexport type TranslationParamsMap = {\n  "key1": undefined;\n  "key2": { param1: string; param2: string };\n  "key3": { param3: string };\n};\n`;
    expect(result).toBe(expected);
  });
});
