export interface Config {
  INPUT_DIR: string | null;
  OUTPUT_PATH: string;
  OUTPUT_FILE_NAME: string;
  JSON_FILE_EXTENSION: string;
}

export const MESSAGES = {
  ERROR: {
    NO_INPUT_DIR:
      "❌ Укажите путь к директории через аргумент или в конфигурационном файле!",
    INVALID_DIR: "❌ Указанная директория не существует или недоступна!",
    GENERIC: "❌ Ошибка при генерации типов:",
  },
  SUCCESS: "✅ Файл translations.d.ts успешно сгенерирован в",
};
