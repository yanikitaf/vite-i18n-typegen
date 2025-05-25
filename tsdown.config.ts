import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts', '!src/**/*.test.ts'],
  minify: true,
  skipNodeModulesBundle: true,
});
