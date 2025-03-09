import { loadConfig } from './config-loader';
import { validateInput } from './input-validator';
import { findJsonFiles, readTranslationFile } from './file-system';
import { flattenObject } from './translation-parser';
import { generateTypeDefinitions } from './type-definition-generator';
import { MESSAGES, type Config } from './constants';
import { promises as fs } from 'fs';
import path from 'path';

async function generateTypes(userConfig: Partial<Config> = {}): Promise<void> {
  try {
    console.log('Запуск генерации типов...');
    const config = await loadConfig();
    const finalConfig: Config = { ...config, ...userConfig };
    const translationsDir = process.argv[2] || finalConfig.INPUT_DIR;
    await validateInput(translationsDir);

    await fs.mkdir(finalConfig.OUTPUT_PATH, { recursive: true });

    const jsonFiles = await findJsonFiles(
      translationsDir!,
      finalConfig.JSON_FILE_EXTENSION,
    );
    console.log(`Найдено файлов: ${jsonFiles.length}`);
    const translations = await Promise.all(jsonFiles.map(readTranslationFile));

    const keyParamsMap = translations.reduce(
      (acc, translation) => ({ ...acc, ...flattenObject(translation) }),
      {} as Record<string, string[]>,
    );

    const outputPath = path.join(
      finalConfig.OUTPUT_PATH,
      finalConfig.OUTPUT_FILE_NAME,
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
}

export default generateTypes;
