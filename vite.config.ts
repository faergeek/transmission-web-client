import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    sourcemap: true,
    target: 'esnext',
  },
  css: {
    devSourcemap: true,
  },
  plugins: [
    react({ plugins: [['@lingui/swc-plugin', {}]] }),
    lingui(),
    visualizer({ emitFile: true }),
  ],
  test: {
    setupFiles: ['./src/tests/setup.ts'],
  },
});
