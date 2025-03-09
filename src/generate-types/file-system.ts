import { promises as fs } from "fs";
import path from "path";

export async function findJsonFiles(
  dir: string,
  fileExtension: string
): Promise<string[]> {
  console.log(`Поиск JSON файлов в директории: ${dir}`);
  const entries = await fs.readdir(dir);
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry);
      const stats = await fs.stat(fullPath);
      return stats.isDirectory()
        ? findJsonFiles(fullPath, fileExtension)
        : fullPath.endsWith(fileExtension)
        ? [fullPath]
        : [];
    })
  );
  return files.flat();
}

export async function readTranslationFile(
  filePath: string
): Promise<Record<string, any>> {
  console.log(`Чтение файла перевода: ${filePath}`);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Ошибка при обработке файла ${filePath}: ${(error as Error).message}`
    );
  }
}
