import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  outDir: 'dist-worker',
  external: ['cloudflare:workers'],
  target: 'es2022',
  platform: 'browser',
  sourcemap: true,
});
