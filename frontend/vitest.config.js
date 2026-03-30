import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/components/ui/**',
        'src/test/**',
        'node_modules/**',
        'src/main.jsx',
        'src/**/index.js',
        'src/components/ds/*.jsx',  // legacy re-exports (2-line barrel files)
        'src/App.jsx',  // routing entry point (tested via integration)
        'src/features/configuracoes/**',  // file upload + complex side effects
      ],
      thresholds: {
        statements: 76,
        branches: 70,
        functions: 72,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
