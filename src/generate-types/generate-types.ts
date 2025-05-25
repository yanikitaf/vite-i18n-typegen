import { MESSAGES } from './constants.js';
import { promises as fs } from 'fs';
import path from 'path';
import type { Config } from '../types.js';
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

    // Загрузка и объединение конфигураций
    const config = await loadConfig();
    const finalConfig: Config = {
      ...config,
      ...userConfig,
    };

    // Валидация входных данных
    const translationsDir = process.argv[2] || finalConfig.inputDir;
    await validateInput(translationsDir!);

    // Создание выходной директории
    await fs.mkdir(finalConfig.outputPath, { recursive: true });

    // Поиск и обработка JSON-файлов
    const jsonFiles = await findJsonFiles(
      translationsDir!,
      finalConfig.jsonFileExtension,
    );

    console.log(`Найдено файлов: ${jsonFiles.length}`);

    // Чтение и обработка переводов
    const allTranslations = await Promise.all(
      jsonFiles.map(({ path: filePath, lang }) =>
        readTranslationFile(filePath, lang),
      ),
    );

    // Сбор метаданных
    const { descriptions, keyParamsMap } = allTranslations.flat().reduce(
      (acc, { key, translations }) => {
        const allParams = new Set<string>();

        Object.values(translations).forEach((text) => {
          // Явно указываем тип для параметра
          const matches = [...text.matchAll(/\{(\w+)\}/g)];
          const params = matches.map((m) => m[1] as string); // Явное приведение типа
          params.forEach((p) => allParams.add(p));
        });

        // Остальная логика без изменений
        if (!acc.descriptions[key]) {
          acc.descriptions[key] = {};
        }
        Object.assign(acc.descriptions[key], translations);

        const existingParams = acc.keyParamsMap[key] || [];
        acc.keyParamsMap[key] = [
          ...new Set([...existingParams, ...Array.from(allParams)]),
        ];

        return acc;
      },
      {
        descriptions: {} as Record<string, Record<string, string>>,
        keyParamsMap: {} as Record<string, string[]>,
      },
    );

    // Генерация и запись типов
    const outputPath = path.join(
      finalConfig.outputPath,
      finalConfig.outputFileName,
    );

    const tsContent = generateTypeDefinitions(keyParamsMap, descriptions);

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

export default generateTypes;
