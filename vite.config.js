import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import http from 'node:http';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Backup only: the app now calls the server directly (see .env.local).
    // If .env.local is missing, /api calls still go through here.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        agent: new http.Agent({ keepAlive: false }), // fresh connection every time
        timeout: 300000,
        proxyTimeout: 300000,
      },
    },
  },
});