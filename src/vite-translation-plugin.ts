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
      generateTypes(config, false);
    } catch (error) {
      console.error(
        '[vite-i18n-typegen] Type generation failed:',
        error instanceof Error ? error.message : error,
      );
    }
  };

  return {
    name: 'vite-i18n-typegen',
    configureServer(server) {
      try {
        safeGenerateTypes();
      } catch (error) {
        server.config.logger.error(
          '[vite-i18n-typegen] Initial type generation failed',
        );
      }

      if (!config.generateOnChange) {
        return;
      }

      try {
        server.watcher
          .add(
            config.includePatterns?.length
              ? config.includePatterns
              : [`**/*${config.localeFilesExtension}`],
          )
          .on('change', (path) => {
            const patterns = config.includePatterns ?? [
              `**/*${config.localeFilesExtension}`,
            ];
            const matched = patterns.some((pattern) =>
              path.endsWith(pattern.replace('**/*', '')),
            );
            if (matched) {
              safeGenerateTypes();
            }
          });
      } catch (error) {
        server.config.logger.error(
          '[vite-i18n-typegen] File watcher setup failed',
        );
      }
    },
  };
};
