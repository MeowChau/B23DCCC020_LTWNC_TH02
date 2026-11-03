import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: { ignored: ['**/.qa/**'] },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      include: ['src/features/**', 'src/utils/**'],
      exclude: ['**/*.test.{ts,tsx}'],
      reporter: ['text', 'html', 'json-summary'],
      thresholds: {
        lines: 70,
        'src/features/**': { lines: 70 },
        'src/utils/**': { lines: 70 },
      },
    },
  },
});
