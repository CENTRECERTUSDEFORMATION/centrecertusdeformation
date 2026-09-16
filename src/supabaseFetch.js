// frontend/src/supabaseFetch.js
import { supabase } from "./supabaseClient";

// ============ SELECT ============
// Supporte deux syntaxes :
//   supabaseSelect("users", "order=created_at.desc")
//   supabaseSelect("users", { select: "id,email", order: "created_at.desc", filter: "is_admin=eq.true" })
export const supabaseSelect = async (table, options = '') => {
  try {
    // Détecter le format de l'appel
    let select = '*';
    let order = null;
    let filters = [];

    if (typeof options === 'string') {
      // Format chaîne : "select=id,email&order=created_at.desc&is_admin=eq.true"
      const params = new URLSearchParams(options);
      if (params.has('select')) select = params.get('select');
      if (params.has('order')) order = params.get('order');

      // Récupérer tous les filtres
      for (const [key, value] of params.entries()) {
        if (key !== 'select' && key !== 'order') {
          filters.push({ key, value });
        }
      }
    } else if (typeof options === 'object') {
      // Format objet
      if (options.select) select = options.select;
      if (options.order) order = options.order;
      if (options.filter) filters.push({ key: 'filter', value: options.filter });
      if (options.id) filters.push({ key: 'id', value: `eq.${options.id}` });
    }

    // Construire la requête
    let query = supabase.from(table).select(select);

    // Appliquer les filtres
    for (const { key, value } of filters) {
      if (key === 'filter' && typeof value === 'string') {
        // Parser le format "colonne=op.valeur"
        const match = value.match(/^([^=]+)=(.+)$/);
        if (match) {
          const [, column, expression] = match;
          const [op, ...rest] = expression.split('.');
          const val = rest.join('.');
          query = applyFilter(query, column, op, val);
        }
      } else if (value.startsWith('eq.')) {
        query = query.eq(key, value.slice(3));
      } else if (value.startsWith('neq.')) {
        query = query.neq(key, value.slice(4));
      } else if (value.startsWith('in.')) {
        const list = value.slice(3).replace(/[()]/g, '').split(',');
        query = query.in(key, list);
      } else if (value.startsWith('is.')) {
        const val = value.slice(3);
        query = query.is(key, val === 'null' ? null : val);
      }
    }

    // Appliquer l'ordre
    if (order) {
      const [column, direction = 'asc'] = order.split('.');
      query = query.order(column, { ascending: direction !== 'desc' });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`❌ Erreur select sur ${table}:`, error);
    throw error;
  }
};

// Helper pour appliquer les filtres
const applyFilter = (query, column, op, value) => {
  switch (op) {
    case 'eq': return query.eq(column, value);
    case 'neq': return query.neq(column, value);
    case 'gt': return query.gt(column, value);
    case 'gte': return query.gte(column, value);
    case 'lt': return query.lt(column, value);
    case 'lte': return query.lte(column, value);
    case 'like': return query.like(column, value);
    case 'ilike': return query.ilike(column, value);
    case 'in': return query.in(column, value.replace(/[()]/g, '').split(','));
    case 'is': return query.is(column, value === 'null' ? null : value);
    default: return query;
  }
};

// ============ INSERT ============
export const supabaseInsert = async (table, data) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error(`❌ Erreur insert sur ${table}:`, error);
    throw error;
  }
};

// ============ UPDATE ============
export const supabaseUpdate = async (table, id, data) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error(`❌ Erreur update sur ${table}:`, error);
    throw error;
  }
};

// ============ DELETE ============
export const supabaseDelete = async (table, id) => {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`❌ Erreur delete sur ${table}:`, error);
    throw error;
  }
};