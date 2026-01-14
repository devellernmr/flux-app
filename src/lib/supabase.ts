import { createClient } from '@supabase/supabase-js';

// Adicione "as string" no final
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Retorna a URL base para as Edge Functions do Supabase.
 * Isso evita URLs hardcoded e facilita a troca de projeto.
 */
export const getFunctionUrl = (functionName: string) => {
  // Remove a barra final se existir e adiciona o caminho da function
  const baseUrl = supabaseUrl.replace(/\/$/, '');
  return `${baseUrl}/functions/v1/${functionName}`;
};
