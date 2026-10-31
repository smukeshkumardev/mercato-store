import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, /api calls are forwarded to the Express backend (no CORS headaches)
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:5000' } },
});
