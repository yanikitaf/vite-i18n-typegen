# vite-plugin-vue-i18n-typegen

Этот плагин обеспечивает автоматическую генерацию TypeScript-типов для локализаций в проектах Vue.js, использующих `vue-i18n`. Это улучшает автодополнение и проверку типов при работе с переводами.

## Установка

Установите плагин с помощью npm или yarn:

```bash
npm install vite-plugin-vue-i18n-typegen --save-dev
```

или

```bash
yarn add vite-plugin-vue-i18n-typegen --dev
```

## Использование

Добавьте плагин в файл конфигурации Vite:

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueI18nTypegen from 'vite-plugin-vue-i18n-typegen';

export default defineConfig({
  plugins: [
    vue(),
    VueI18nTypegen({
      // Опции плагина
    }),
  ],
});
```

После настройки плагин будет автоматически генерировать типы для ваших файлов локализации, обеспечивая лучшую интеграцию с TypeScript.

## Лицензия

Этот проект лицензирован под лицензией MIT.
