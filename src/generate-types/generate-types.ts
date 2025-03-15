import { MESSAGES } from './constants.js';
import { promises as fs } from 'fs';
import path from 'path';
import type { Config } from '../types.js';
import { flattenObject } from './translationParser/flattenObject.js';
import { loadConfig } from './loadConfig/loadConfig.js';
import { findJsonFiles } from './findJsonFiles/findJsonFiles.js';
import { readTranslationFile } from './readTranslationFile/readTranslationFile.js';
import { validateInput } from './validateInput/validateInput.js';
import { generateTypeDefinitions } from './generateTypeDefinitions/generateTypeDefinitions.js';

const generateTypes = async (
  userConfig: Partial<Config> = {},
): Promise<void> => {
  try {
    console.log('Запуск генерации типов...');
    const config = await loadConfig();
    const finalConfig: Config = { ...config, ...userConfig };
    const translationsDir = process.argv[2] || finalConfig.inputDir;
    await validateInput(translationsDir);

    await fs.mkdir(finalConfig.outputPath, { recursive: true });

    const jsonFiles = await findJsonFiles(
      translationsDir!,
      finalConfig.jsonFileExtension,
    );
    console.log(`Найдено файлов: ${jsonFiles.length}`);
    const translations = await Promise.all(jsonFiles.map(readTranslationFile));

    const keyParamsMap = translations.reduce(
      (acc, translation) => ({ ...acc, ...flattenObject(translation) }),
      {} as Record<string, string[]>,
    );

    const outputPath = path.join(
      finalConfig.outputPath,
      finalConfig.outputFileName,
    );
    const tsContent = generateTypeDefinitions(keyParamsMap);
    await fs.writeFile(outputPath, tsContent);

    console.log(`${MESSAGES.SUCCESS} ${outputPath}`);
  } catch (error) {
    console.error(
      (error as Error).message.startsWith('❌')
        ? (error as Error).message
        : `${MESSAGES.ERROR.GENERIC} ${(error as Error).message}`,
    );
    process.exit(1);
  }
};

export default generateTypes;
