import { promises as fs } from 'fs';
import { MESSAGES } from '../constants.js';

export const validateInput = async (dirPath: string | null): Promise<void> => {
  console.log(`Проверка входных данных: ${dirPath}`);
  if (!dirPath) throw new Error(MESSAGES.ERROR.NO_INPUT_DIR);
  try {
    await fs.access(dirPath);
  } catch {
    throw new Error(MESSAGES.ERROR.INVALID_DIR);
  }
};
