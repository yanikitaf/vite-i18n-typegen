import { promises as fs } from 'fs';
import path from 'path';

export async function findJsonFiles(
  baseDir: string,
  fileExtension: string,
): Promise<{ lang: string; path: string }[]> {
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      const lang = entry.name;
      const langFiles = await findJsonFiles(fullPath, fileExtension);
      result.push(...langFiles.map((f) => ({ lang, path: f.path })));
    } else if (fullPath.endsWith(fileExtension)) {
      result.push({ lang: path.basename(baseDir), path: fullPath });
    }
  }

  return result;
}
