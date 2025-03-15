// validateInput.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { promises as fs } from 'fs';
import { MESSAGES } from '../constants.js';
import { validateInput } from './validateInput.js';

// Мокаем модуль fs
vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
  },
}));

const mockedFsAccess = vi.mocked(fs.access);

describe('validateInput', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Очистка моков перед каждым тестом
  });

  describe('Некорректные входные данные', () => {
    it('должна выбрасывать ошибку, если dirPath = null', async () => {
      await expect(validateInput(null)).rejects.toThrow(
        MESSAGES.ERROR.NO_INPUT_DIR,
      );
    });

    it('должна выбрасывать ошибку, если dirPath = пустая строка', async () => {
      await expect(validateInput('')).rejects.toThrow(
        MESSAGES.ERROR.NO_INPUT_DIR,
      );
    });
  });

  describe('Проверка существования директории', () => {
    it('должна выбрасывать ошибку, если директория недоступна', async () => {
      mockedFsAccess.mockRejectedValue(new Error('Директория не существует'));

      await expect(validateInput('invalid/path')).rejects.toThrow(
        MESSAGES.ERROR.INVALID_DIR,
      );
      expect(mockedFsAccess).toHaveBeenCalledWith('invalid/path');
    });

    it('не должна выбрасывать ошибку, если директория доступна', async () => {
      mockedFsAccess.mockResolvedValue(undefined);

      await expect(validateInput('valid/path')).resolves.not.toThrow();
      expect(mockedFsAccess).toHaveBeenCalledWith('valid/path');
    });
  });

  it('должна логировать входные данные', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await validateInput('test/path');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Проверка входных данных: test/path',
    );

    consoleSpy.mockRestore();
  });
});
