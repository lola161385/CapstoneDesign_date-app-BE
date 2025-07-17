import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://210.109.54.109:8080', // Spring Boot
      // '/api': 'http://210.109.54.109:8000', // FastAPI
    },
  },
});