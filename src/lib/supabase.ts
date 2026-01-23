import { createClient } from '@supabase/supabase-js';

// Adicione "as string" no final
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase environment variables are missing. Please check your .env file.',
    { supabaseUrl, supabaseAnonKey }
  );
}

export const supabase = createClient(
  supabaseUrl || 'http://127.0.0.1:54321',
  supabaseAnonKey || 'placeholder-anon-key'
);

/**
 * Retorna a URL base para as Edge Functions do Supabase.
 * Isso evita URLs hardcoded e facilita a troca de projeto.
 */
export const getFunctionUrl = (functionName: string) => {
  // Remove a barra final se existir e adiciona o caminho da function
  const baseUrl = supabaseUrl.replace(/\/$/, '');
  return `${baseUrl}/functions/v1/${functionName}`;
};
