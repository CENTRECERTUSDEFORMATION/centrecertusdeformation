// frontend/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rdttnpdjeuteeuwvggai.supabase.co';

// ✅ VOTRE VRAIE CLÉ ANON (publique) - Copiée de votre message
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdHRucGRqZXV0ZWV1d3ZnZ2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4OTI3ODMsImV4cCI6MjA4NjQ2ODc4M30.XG3YD4SOkjddvS76KaJS2dHHNdXcXSdVR765E-G_7g4';

// ✅ VOTRE VRAIE CLÉ SERVICE ROLE (admin) - Copiée de votre message
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdHRucGRqZXV0ZWV1d3ZnZ2FpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDg5Mjc4MywiZXhwIjoyMDg2NDY4NzgzfQ.R-msKkdI6u2w0cA3x3f7Eww_mSsQ7zK7AeX8p9jS6UY';

// Client standard (pour l'authentification et les requêtes normales)
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

// Client admin (pour les opérations d'administration uniquement)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// ============ FONCTIONS UTILITAIRES ============

// SELECT - Récupérer des données
export const supabaseSelect = async (table, query = '') => {
  try {
    const { data, error } = await supabase.from(table).select(query);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`❌ Erreur select sur ${table}:`, error);
    throw error;
  }
};

// INSERT - Insérer des données
export const supabaseInsert = async (table, data) => {
  try {
    const { data: result, error } = await supabase.from(table).insert(data).select();
    if (error) throw error;
    return result;
  } catch (error) {
    console.error(`❌ Erreur insert sur ${table}:`, error);
    throw error;
  }
};

// UPDATE - Mettre à jour des données
export const supabaseUpdate = async (table, id, data) => {
  try {
    const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select();
    if (error) throw error;
    return result;
  } catch (error) {
    console.error(`❌ Erreur update sur ${table}:`, error);
    throw error;
  }
};

// DELETE - Supprimer des données
export const supabaseDelete = async (table, id) => {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`❌ Erreur delete sur ${table}:`, error);
    throw error;
  }
};

console.log('✅ Supabase initialisé avec succès');
console.log('🔗 URL:', supabaseUrl);