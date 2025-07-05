import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteReact(),
    nodePolyfills({
      exclude: ['fs'],
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      buffer: 'vite-plugin-node-polyfills/shims/buffer',
      global: 'vite-plugin-node-polyfills/shims/global',
      process: 'vite-plugin-node-polyfills/shims/process',
    },
  },
  envPrefix: ['VITE_'],
});
