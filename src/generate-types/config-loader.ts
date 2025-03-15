import { promises as fs } from 'fs';
import path from 'path';
import type { Config } from './constants.js';

const DEFAULT_CONFIG: Config = {
  inputDir: null,
  outputPath: './',
  outputFileName: 'translations.d.ts',
  jsonFileExtension: '.json',
};

export async function loadConfig(): Promise<Config> {
  console.log('Загрузка конфигурации...');
  const configPath = path.join(process.cwd(), 'translation-config.json');
  try {
    await fs.access(configPath);
    const content = await fs.readFile(configPath, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(content) };
  } catch {
    return DEFAULT_CONFIG;
  }
}
