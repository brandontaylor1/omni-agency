import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Create a Supabase client with the admin key for server-side operations
export const createAdminClient = () => {
  const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseAdminKey) {
    throw new Error('Missing Supabase admin key');
  }

  return createClient<Database>(
    supabaseUrl,
    supabaseAdminKey,
    {
      auth: {
        persistSession: false,
      }
    }
  );
};
