// frontend/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rdttnpdjeuteeuwvggai.supabase.co';
// Utilisation de la nouvelle publishable key (remplace l'ancienne anon key)
const supabaseAnonKey = 'sb_publishable__KLqCBiq6w5S-4jhoR2bYQ_HB8IVPpT';
// Gardez votre service key (elle reste valide)
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdHRucGRqZXV0ZWV1d3ZnZ2FpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDg5Mjc4MywiZXhwIjoyMDg2NDY4NzgzfQ.R-msKkdI6u2w0cA3x3f7Eww_mSsQ7zK7AeX8p9jS6UY';

// Configuration pour éviter l'erreur de lock
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'supabase-auth-token',
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('✅ Supabase initialisé avec nouvelle clé publishable');