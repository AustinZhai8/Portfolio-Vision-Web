import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Without this guard createClient() throws a bare "supabaseUrl is required" at
// module-evaluation time — before React mounts — so the page goes white with
// only that in the console. Easy to hit, because vite.config.js sets
// envDir: '..' and so reads .env from the repo root, not frontend/.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase env vars are missing. VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
      'must be set in .env at the REPO ROOT (not frontend/), and in the Vercel ' +
      'project dashboard for deployments.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
