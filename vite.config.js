import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "/saudediaria/", // substitua pelo nome real do seu repo no GitHub
  plugins: [react()],
});