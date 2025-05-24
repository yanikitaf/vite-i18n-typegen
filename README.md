# vite-plugin-vue-i18n-typegen

`vite-plugin-vue-i18n-typegen` — это плагин для Vite, который автоматически генерирует типы TypeScript для файлов переводов, основанных на JSON, что позволяет обеспечить строгую типизацию при использовании Vue i18n.

## Установка

Установите плагин с помощью npm или yarn:

```bash
npm  install  vite-plugin-vue-i18n-typegen  --save-dev
```

или

```bash
yarn  add -D  vite-plugin-vue-i18n-typegen
```

## Использование

Добавьте плагин в файл конфигурации Vite:

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { translationPlugin } from 'vite-plugin-vue-i18n-typegen';

export default defineConfig({
  plugins: [
    vue(),
    translationPlugin({
      // Опции плагина
    }),
  ],
});
```

После настройки плагин будет автоматически генерировать типы для ваших файлов локализации, обеспечивая лучшую интеграцию с TypeScript.

## Конфигурация плагина

Плагин принимает следующие настройки, которые можно настроить через объект конфигурации:

```typescript
export interface Config {
  // Путь к директории, где лежат JSON-файлы с переводами.
  // По умолчанию: null
  inputDir: string | null;

  // Путь, куда будет сохранён сгенерированный файл с типами.
  // По умолчанию: './'
  outputPath: string;

  // Имя итогового файла с типами.
  // По умолчанию: 'translations.d.ts'
  outputFileName: string;

  // Расширение файлов, которые необходимо обрабатывать.
  // По умолчанию: '.json'
  jsonFileExtension: string;
}
```

## Пример исходного JSON-файла с переводами

Плагин анализирует JSON-файлы с переводами, например:

```json
{
  "messages": {
    "notification": "You have {count} new message",
    "lastLogin": "Last login: {date}",
    "profile": {
      "title": "User Profile",
      "description": "Hello, {name}! Here you can manage your settings."
    }
  }
}
```

## Сгенерированные типы

На основе такого JSON-файла плагин генерирует типы для ключей переводов и маппинга параметров. Пример полученных типов:

```typescript
export type TranslationKeys =
  | 'messages.notification'
  | 'messages.lastLogin'
  | 'messages.profile.title'
  | 'messages.profile.description';

export type TranslationParamsMap = {
  'messages.notification': { count: string | number | Date };
  'messages.lastLogin': { date: string | number | Date };
  'messages.profile.title': undefined;
  'messages.profile.description': { name: string | number | Date };
};
```

## Пример использования

Плагин предоставляет типизированную функцию перевода, которая позволяет отслеживать корректность передаваемых ключей и параметров. Пример использования:

```typescript
// Импортируем сгенерированные типы
import type {
  TranslationKeys,
  TranslationParamsMap,
} from './generated-types/translations';
// Импортируем утилитарный тип из vite-plugin-vue-i18n-typegen
import type { TranslateFunction } from 'vite-plugin-vue-i18n-typegen';

// TranslateFunction предоставляется плагином
declare const translate: TranslateFunction<
  // TranslationKeys и TranslationParamsMap получаем из сгенерированных типов
  TranslationKeys,
  TranslationParamsMap
>;

// использовать типизацию можете на ваше усмотрение
const translate = i18n.global.t as TranslateFunction<
  TranslationKeys,
  TranslationParamsMap
>;

// Примеры использования:
translate('messages.notification', { count: 1 }); // Всё корректно: для ключа ожидается параметр count
translate('messages.notification'); // Также корректно: параметр count не является обязательным
translate('messages.notification', { count: '1', name: 'John' }); // Ошибка: для этого ключа параметр name не предусмотрен
```

## Заключение

Использование `vite-plugin-vue-i18n-typegen` позволяет:

- Автоматически генерировать типы для переводов, избавляя вас от ручной работы.
- Обеспечить строгую типизацию, что помогает избежать ошибок при передаче неправильных ключей или параметров.
- Легко интегрировать генерацию типов в процесс сборки вашего проекта на Vite.
