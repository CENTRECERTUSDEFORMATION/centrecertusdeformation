// frontend/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rdttnpdjeuteeuwvggai.supabase.co';

// ✅ Clé anon (publique) - Utilisée côté client
// Cette clé est publique par nature et peut être exposée dans le navigateur.
// Elle est protégée par RLS qui contrôle ce qui est accessible.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdHRucGRqZXV0ZWV1d3ZnZ2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4OTI3ODMsImV4cCI6MjA4NjQ2ODc4M30.XG3YD4SOkjddvS76KaJS2dHHNdXcXSdVR765E-G_7g4';

// ============================================
// 🔒 CLIENT SUPABASE PRINCIPAL
// ============================================
// Ce client utilise la clé anon et bénéficie de la session utilisateur.
// RLS s'applique : chaque utilisateur ne voit que ce qui l'autorise.
// ============================================
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

// ============================================
// ⚠️ REMARQUE DE SÉCURITÉ
// ============================================
// La clé `service_role` a été RETIRÉE de ce fichier pour des raisons de sécurité.
//
// ❌ La clé `service_role` ne doit JAMAIS être exposée dans le navigateur.
// ❌ Elle donne un accès total à la base, en contournant RLS.
//
// Pour les opérations qui nécessitent cette clé (création/suppression
// d'utilisateurs Auth, par exemple), il faut utiliser :
//
//   1. Une EDGE FUNCTION Supabase (recommandé)
//      → Le code s'exécute côté serveur, la clé reste secrète
//
//   2. Un BACKEND dédié (Node.js, Express, etc.)
//      → Le frontend appelle une API, le backend utilise la clé
//
// ============================================

console.log('✅ Supabase initialisé avec succès');
console.log('🔗 URL:', supabaseUrl);