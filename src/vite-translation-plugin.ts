import type { Plugin } from 'vite';
import generateTypes from './generate-types/generate-types.js';

type UserConfig = Record<string, unknown>;

export default function translationPlugin(userConfig: UserConfig = {}): Plugin {
  return {
    name: 'translation-types-generator',
    configureServer(server) {
      const loadConfig = async (): Promise<UserConfig> => {
        try {
          return { ...userConfig };
        } catch (e) {
          return userConfig;
        }
      };

      loadConfig()
        .then((config) => {
          generateTypes(config);
        })
        .catch((error: unknown) => {
          if (error instanceof Error) {
            server.config.logger.error(error.message);
          } else {
            server.config.logger.error('An unknown error occurred');
          }
        });
    },
  };
}
