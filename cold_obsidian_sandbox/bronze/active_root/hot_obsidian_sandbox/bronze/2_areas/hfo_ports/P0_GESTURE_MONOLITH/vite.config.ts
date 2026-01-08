import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['golden-layout', 'lil-gui', 'xstate', 'zod'],
  },
});
