// frontend/src/supabaseFetch.js
const SUPABASE_URL = 'https://rdttnpdjeuteeuwvggai.supabase.co';
const SUPABASE_KEY = 'sb_publishable__KLqCBiq6w5S-4jhoR2bYQ_HB8IVPpT';

// Fonction utilitaire pour construire l'URL
const buildUrl = (table, options = {}) => {
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  const conditions = [];
  
  if (options.id) {
    conditions.push(`id=eq.${options.id}`);
  }
  
  if (options.select) {
    conditions.push(`select=${options.select}`);
  }
  
  if (options.order) {
    conditions.push(`order=${options.order}`);
  }
  
  if (options.filter) {
    conditions.push(options.filter);
  }
  
  if (conditions.length > 0) {
    url += `?${conditions.join('&')}`;
  }
  
  return url;
};

export const supabaseSelect = async (table, options = {}) => {
  const url = buildUrl(table, options);
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Erreur HTTP ${response.status}`);
  }
  
  return response.json();
};

export const supabaseInsert = async (table, data) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Erreur HTTP ${response.status}`);
  }
  
  return { success: true };
};

export const supabaseUpdate = async (table, id, data) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Erreur HTTP ${response.status}`);
  }
  
  return { success: true };
};

export const supabaseDelete = async (table, id) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Erreur HTTP ${response.status}`);
  }
  
  return { success: true };
};