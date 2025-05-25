import type { Plugin } from 'vite';
import type { Config } from './types.js';
import generateTypes from './generate-types/generate-types.js';

type UserConfig = Partial<Config>;

export const translationPlugin = (userConfig: UserConfig = {}): Plugin => {
  const config: UserConfig = {
    generateOnChange: false,
    localeFilesExtension: '.json',
    ...userConfig,
  };

  const safeGenerateTypes = () => {
    try {
      generateTypes(config);
    } catch (error) {
      console.error(
        '[translation-plugin] Type generation failed:',
        error instanceof Error ? error.message : error,
      );
    }
  };

  return {
    name: 'vite-plugin-vue-i18n-typegen',
    configureServer(server) {
      try {
        safeGenerateTypes();
      } catch (error) {
        server.config.logger.error(
          '[vite-plugin-vue-i18n-typegen] Initial type generation failed',
        );
      }

      if (!config.generateOnChange) {
        return;
      }

      try {
        server.watcher
          .add(`**/*${config.localeFilesExtension}`)
          .on('change', (path) => {
            if (path.endsWith(config.localeFilesExtension ?? '.json')) {
              safeGenerateTypes();
            }
          });
      } catch (error) {
        server.config.logger.error(
          '[vite-plugin-vue-i18n-typegen] File watcher setup failed',
        );
      }
    },
  };
};
