import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for PAKKAM Delivery Partner Web App on Port 5174
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
  },
});
