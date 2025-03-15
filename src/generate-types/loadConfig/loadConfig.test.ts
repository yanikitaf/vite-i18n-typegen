import { describe, it, expect, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { loadConfig } from './loadConfig.js';
import { DEFAULT_CONFIG } from './constants.js';

vi.mock('fs');
vi.mock('path');

describe('loadConfig', () => {
  it('следует загрузить конфигурацию из файла, если он существует', async () => {
    const configPath = '/mock/path/translation-config.json';
    const mockConfig = {
      inputDir: '/custom/input',
      outputPath: './custom/output',
    };

    vi.mocked(path.join).mockReturnValue(configPath);
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));

    const config = await loadConfig();

    expect(config).toEqual({ ...DEFAULT_CONFIG, ...mockConfig });
  });

  it('должен возвращать конфигурацию по умолчанию, если файл не существует', async () => {
    const configPath = '/mock/path/translation-config.json';

    vi.mocked(path.join).mockReturnValue(configPath);
    vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));

    const config = await loadConfig();

    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('должен возвращать конфигурацию по умолчанию, если файл содержит недопустимый JSON', async () => {
    const configPath = '/mock/path/translation-config.json';

    vi.mocked(path.join).mockReturnValue(configPath);
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue('invalid json');

    const config = await loadConfig();

    expect(config).toEqual(DEFAULT_CONFIG);
  });
});
