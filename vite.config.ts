/// <reference types="vitest" />
import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/transmission-web-client',
  build: {
    sourcemap: true,
    target: 'esnext',
  },
  css: {
    devSourcemap: true,
  },
  plugins: [react({ plugins: [['@lingui/swc-plugin', {}]] }), lingui()],
  test: {
    setupFiles: ['./src/tests/setup.ts'],
  },
});
