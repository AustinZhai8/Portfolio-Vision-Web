import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // .env lives at the repo root (one level up from this config) so the
  // import script (backend/scripts/) and vercel dev can share it.
  envDir: '..',
})
