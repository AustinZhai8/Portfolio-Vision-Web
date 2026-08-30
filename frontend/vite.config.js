import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // .env lives at the repo root (one level up from this config) so the
  // import script (backend/scripts/) and vercel dev can share it.
  envDir: '..',
  build: {
    // Explicit, though false is already the default. Stated so that turning
    // source maps on for production becomes a deliberate edit rather than a
    // side effect of some future config change.
    sourcemap: false,
    rollupOptions: {
      output: {
        // Everything used to land in one chunk, so any app-code edit changed the
        // hash of the whole bundle and every visitor re-downloaded React and
        // Supabase along with it. These two move rarely; splitting them means
        // they stay cached across deploys.
        //
        // Vite 8 bundles with rolldown, which requires the function form here —
        // the object form throws "manualChunks is not a function" at build time.
        // Paths are matched with a [\\/] class because this builds on Windows
        // locally and Linux on Vercel.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'vendor-react';
          }
          if (id.includes('@supabase')) return 'vendor-supabase';
        },
      },
    },
  },
})
