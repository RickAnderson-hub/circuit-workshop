/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        localStorage: true,
      },
    },
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
});
