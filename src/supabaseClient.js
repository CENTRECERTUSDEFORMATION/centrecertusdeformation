// frontend/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rdttnpdjeuteeuwvggai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdHRucGRqZXV0ZWV1d3ZnZ2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4OTI3ODMsImV4cCI6MjA4NjQ2ODc4M30.XG3YD4SOkjddvS76KaJS2dHHNdXcXSdVR765E-G_7g4';
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

console.log('✅ Supabase initialisé');