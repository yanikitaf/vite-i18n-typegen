import { promises as fs } from 'fs';

export const readTranslationFile = async (
  filePath: string,
): Promise<Record<string, any>> => {
  console.log(`Чтение файла перевода: ${filePath}`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Ошибка при обработке файла ${filePath}: ${(error as Error).message}`,
    );
  }
};
