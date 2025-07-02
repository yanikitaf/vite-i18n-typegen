import { MESSAGES } from './constants.js';
import { promises as fs } from 'fs';
import path from 'path';
import type { Config } from '../types.js';
import { loadConfig } from './loadConfig/loadConfig.js';
import { findJsonFiles } from './findJsonFiles/findJsonFiles.js';
import { readTranslationFile } from './readTranslationFile/readTranslationFile.js';
import { validateInput } from './validateInput/validateInput.js';
import { generateTypeDefinitions } from './generateTypeDefinitions/generateTypeDefinitions.js';

const extractKeyParams = (translations: Record<string, string>): string[] => {
  const allParams = new Set<string>();
  for (const text of Object.values(translations)) {
    const params = extractParamsFromText(text);
    params.forEach((p) => allParams.add(p));
  }
  return Array.from(allParams);
};

const extractParamsFromText = (text: string): string[] => {
  const params: string[] = [];
  const matches = text.matchAll(/\{(\w+)\}/g);
  if (matches) {
    for (const match of matches) {
      if (match[1]) {
        params.push(match[1]);
      }
    }
  }
  return params;
};

const processTranslations = async (
  userConfig: Partial<Config> = {},
): Promise<void> => {
  try {
    console.log('Запуск генерации типов...');

    // 1. Load and merge configurations
    const config = await loadConfig();
    const finalConfig: Config = {
      ...config,
      ...userConfig,
    };

    // 2. Validate input
    const translationsDir = process.argv[2] || finalConfig.inputDir;
    await validateInput(translationsDir!);

    // 3. Find JSON files
    const jsonFiles = await findJsonFiles(
      translationsDir!,
      finalConfig.localeFilesExtension,
      finalConfig.includePatterns,
    );
    console.log(`Найдено файлов: ${jsonFiles.length}`);

    // 4. Read and process translations
    const allTranslations = await Promise.all(
      jsonFiles.map(({ path: filePath, lang }) =>
        readTranslationFile(filePath, lang),
      ),
    );

    // 5. Collect metadata

    const flattenedTranslations = allTranslations.flat();

    const { descriptions, keyParamsMap } = flattenedTranslations.reduce(
      (acc, item) => {
        const { key, translations } = item;
        acc.descriptions[key] = { ...acc.descriptions[key], ...translations };
        acc.keyParamsMap[key] = extractKeyParams(translations);
        return acc;
      },
      {
        descriptions: {} as Record<string, Record<string, string>>,
        keyParamsMap: {} as Record<string, string[]>,
      },
    );

    // 6. Generate and write type definitions
    const outputPath = path.join(
      finalConfig.outputPath,
      finalConfig.outputFileName,
    );
    const tsContent = generateTypeDefinitions(
      keyParamsMap,
      descriptions,
      finalConfig,
    );
    await fs.writeFile(outputPath, tsContent);
    console.log(`${MESSAGES.SUCCESS} ${outputPath}`);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(
      errorMessage.startsWith('❌')
        ? errorMessage
        : `${MESSAGES.ERROR.GENERIC} ${errorMessage}`,
    );
    process.exit(1);
  }
};

export default processTranslations;
