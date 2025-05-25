vite-plugin-vue-i18n-typegen 🌍✨
================================

`vite-plugin-vue-i18n-typegen` — революционный плагин для Vite, который превращает ваши JSON-переводы в строго типизированный TypeScript код с интегрированной документацией. Забудьте об ошибках в ключах и параметрах — теперь ваши переводы защищены типами и самодокументированы!

[![npm version](https://img.shields.io/npm/v/vite-plugin-vue-i18n-typegen.svg)](https://www.npmjs.com/package/vite-plugin-vue-i18n-typegen)  
[![license](https://img.shields.io/npm/l/vite-plugin-vue-i18n-typegen.svg)](https://github.com/yanikitaf/vite-plugin-vue-i18n-typegen/blob/main/LICENSE)

🚀 Возможности
--------------

*   ✅ **Генерация TypeScript типов** для ключей переводов
    
*   🛡 **Валидация параметров** в реальном времени
    
*   📚 **Автоматическая JSDoc документация** для каждого ключа
    
*   🌐 **Поддержка мультиязычной документации**
    
*   ⚡ **Генерация при изменениях** (watch mode)
    
*   🔧 **Гибкая настройка** под любую структуру проекта
    

📦 Установка
------------

```bash
npm  install  vite-plugin-vue-i18n-typegen  --save-dev
```

или

```bash
yarn  add -D  vite-plugin-vue-i18n-typegen
```

⚙️ Конфигурация
---------------

Добавьте в ваш `vite.config.ts`:

```typescript

import { defineConfig } from 'vite';
import { translationPlugin } from 'vite-plugin-vue-i18n-typegen';

export default defineConfig({
  plugins: [
    translationPlugin({
      inputDir: './locales',    // Путь к папке с переводами
      outputPath: './src/i18n', // Куда сохранять типы
      preferredLangOrder: ['en', 'ru'], // Порядок языков в документации
      generateDocs: true,       // Включить генерацию JSDoc
      generateOnChange: true    // Автообновление при изменениях
    })
  ]
});
```

### Полный список опций:

```typescript

interface Config {
  inputDir?: string | null;      // Папка с переводами (default: null)
  outputPath?: string;           // Путь для генерации типов (default: './')
  outputFileName?: string;       // Имя файла с типами (default: 'translations.d.ts')
  localeFilesExtension?: string; // Расширение файлов переводов (default: '.json')
  generateKeys?: boolean;        // Генерировать типы для ключей (default: true)
  generateParams?: boolean;      // Генерировать типы параметров (default: true)
  generateDocs?: boolean;        // Генерировать JSDoc документацию (default: false)
  preferredLangOrder?: string[]; // Приоритет языков для документации
  generateOnChange?: boolean;    // Автогенерация при изменениях (default: false)
}
```

🎯 Использование
----------------

### 1. Подключение типов

```typescript

import type {
  TranslationKeys,
  TranslationParamsMap,
  TranslateFunctionDocs
} from './your-generated-path/translations';

const translate = i18n.global.t as TranslateFunction<
  TranslationKeys,
  TranslationParamsMap
> & TranslateFunctionDocs;
```

### 2. Пример работы с переводами

```typescript

// Полная типобезопасность и документация!
translate('common.welcome'); // ✅
translate('dashboard.title', { userName: 'John' }); // ✅

// Ошибки TypeScript:
translate('common.welcom'); // 🛑 Опечатка в ключе!
translate('dashboard.title', { user: 'John' }); // 🛑 Неверный параметр!
```
### 3. Встроенная документация

При наведении на ключ перевода в IDE вы увидите:

```typescript

\**
 \* Welcome! / Добро пожаловать!
 \*
 \* @translations
 \* | lang | translation       |
 \* | ---- | ----------------- |
 \* | en   | Welcome!          |
 \* | ru   | Добро пожаловать! \*
(key: "common.welcome"): string;
```
![IDE Preview](https://via.placeholder.com/800x400.png?text=IDE+Documentation+Preview)

🏗 Пример структуры переводов
-----------------------------

`locales/en.json`

```json

{
  "common": {
    "welcome": "Welcome!",
    "buttons": {
      "submit": "Submit",
      "cancel": "Cancel"
    }
  },
  "dashboard": {
    "title": "Hello, {userName}!",
    "stats": {
      "users": "Total users: {count}"
    }
  }
}
```
🔮 Генерируемые типы
--------------------

`translations.d.ts`

```typescript

export type TranslationKeys = 
  | 'common.welcome'
  | 'common.buttons.submit'
  | 'common.buttons.cancel'
  | 'dashboard.title'
  | 'dashboard.stats.users';

export type TranslationParamsMap = {
  'dashboard.title': { userName: string | number | Date };
  'dashboard.stats.users': { count: string | number | Date };
};

export interface TranslateFunctionDocs {
  \**
   \* Welcome! / Добро пожаловать!
   \* 
   \* @translations
   \* | lang | translation       |
   \* | ---- | ----------------- |
   \* | en   | Welcome!          |
   \* | ru   | Добро пожаловать! */
  (key: "common.welcome"): string;
  
  \**
   \* Hello, {userName}! / Здравствуйте, {userName}!
   \* 
   \* @translations
   \* | lang | translation               |
   \* | ---- | ------------------------- |
   \* | en   | Hello, {userName}!        |
   \* | ru   | Здравствуйте, {userName}! */
  (key: "dashboard.title", params: { userName: string }): string;
}
```
💡 Почему этот плагин?
----------------------

*   🛠 **Полная типобезопасность** — больше никаких опечаток в ключах!
    
*   📖 **Живая документация** — вся информация о переводах под рукой
    
*   ⏱ **Экономия времени** — автоматическая генерация всего кода
    
*   🧩 **Простая интеграция** — подключил и забыл
    
*   🔥 **Поддержка Vue 3** — современное решение для современных проектов
    

👥 Сообщество
-------------

Нашли баг или есть предложение? [Создайте issue](https://github.com/yanikitaf/vite-plugin-vue-i18n-typegen/issues)!

Хотите помочь с развитием? Форки и пул-реквесты приветствуются!

📄 Лицензия
-----------

MIT © [Nikita Fil](https://github.com/yanikitaf)
