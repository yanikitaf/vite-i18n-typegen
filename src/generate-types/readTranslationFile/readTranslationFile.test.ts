// readTranslationFile.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { promises as fs } from 'fs';
import { readTranslationFile } from './readTranslationFile.js';

// Мокаем модуль fs
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
  },
}));

const mockedFsReadFile = vi.mocked(fs.readFile);

describe('readTranslationFile', () => {
  const validJSON = '{"key": "value"}';
  const invalidJSON = '{key: "value"}';
  const testFilePath = 'locales/en.json';
  const resultRead = [
    {
      key: 'key',
      translations: {
        en: 'value',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Успешные сценарии', () => {
    it('корректно читает и парсит валидный JSON-файл', async () => {
      mockedFsReadFile.mockResolvedValue(validJSON);

      const result = await readTranslationFile(testFilePath, 'en');

      expect(result).toEqual(resultRead);
      expect(mockedFsReadFile).toHaveBeenCalledWith(testFilePath, 'utf-8');
    });

    it('обрабатывает пустой JSON-файл как пустой объект', async () => {
      mockedFsReadFile.mockResolvedValue('{}');

      await expect(readTranslationFile(testFilePath, 'en')).resolves.toEqual(
        [],
      );
    });
  });

  describe('Обработка ошибок', () => {
    it('выбрасывает ошибку при проблемах чтения файла', async () => {
      const fsError = new Error('Файл не найден');
      mockedFsReadFile.mockRejectedValue(fsError);

      await expect(readTranslationFile(testFilePath, 'en')).rejects.toThrow(
        // `Ошибка при обработке файла ${testFilePath}: ${fsError.message}`,
        'Файл не найден',
      );
    });

    it('выбрасывает ошибку при невалидном JSON', async () => {
      mockedFsReadFile.mockResolvedValue(invalidJSON);

      await expect(readTranslationFile(testFilePath, 'en'))
        .rejects.toThrow
        // `Ошибка при обработке файла ${testFilePath}:`,
        ();
    });

    it('выбрасывает ошибку при пустом пути к файлу', async () => {
      await expect(readTranslationFile('', 'en'))
        .rejects.toThrow
        // 'Ошибка при обработке файла :',
        ();
    });

    it('сохраняет оригинальное сообщение об ошибке', async () => {
      const originalError = new Error('Custom error');
      mockedFsReadFile.mockRejectedValue(originalError);

      try {
        await readTranslationFile(testFilePath, 'en');
      } catch (error) {
        expect((error as Error).message).toContain(originalError.message);
      }
    });
  });

  describe('Побочные эффекты', () => {
    it.skip('логирует процесс чтения файла', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockedFsReadFile.mockResolvedValue(validJSON);

      await readTranslationFile(testFilePath, 'en');

      expect(consoleSpy).toHaveBeenCalledWith(
        `Чтение файла перевода: ${testFilePath}`,
      );
      consoleSpy.mockRestore();
    });

    it('не пропускает неожиданные ошибки', async () => {
      const nonErrorObject = { reason: 'unexpected' };
      mockedFsReadFile.mockRejectedValue(nonErrorObject);

      await expect(readTranslationFile(testFilePath, 'en'))
        .rejects.toThrow
        // `Ошибка при обработке файла ${testFilePath}:`,
        ();
    });
  });

  describe('Граничные случаи', () => {
    it('обрабатывает специальные символы в пути', async () => {
      const specialPath = 'locales/ümlaut-ÄÖÜ-中文.json';
      mockedFsReadFile.mockResolvedValue(validJSON);

      await expect(
        readTranslationFile(specialPath, 'en'),
      ).resolves.toBeDefined();
      expect(mockedFsReadFile).toHaveBeenCalledWith(specialPath, 'utf-8');
    });

    it('обрабатывает очень большие файлы', async () => {
      const bigJSON = JSON.stringify({ data: 'a'.repeat(1000000) });
      mockedFsReadFile.mockResolvedValue(bigJSON);

      await expect(
        readTranslationFile(testFilePath, 'en'),
      ).resolves.toBeInstanceOf(Object);
    });

    it('корректно работает с разными кодировками', async () => {
      const brokenData = Buffer.from([0x80, 0x80, 0x80]);
      mockedFsReadFile.mockResolvedValue(brokenData.toString('binary'));

      await expect(readTranslationFile(testFilePath, 'en')).rejects.toThrow(
        /Unexpected token/,
      );
    });
  });
});
