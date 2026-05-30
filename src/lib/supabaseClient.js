import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

// Robust check to prevent crashes if placeholders are unmodified
const url = supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL' || !supabaseUrl.startsWith('http')
  ? 'https://mock.supabase.co'
  : supabaseUrl;

const key = supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY'
  ? 'mock-anon-key'
  : supabaseAnonKey;

export const supabase = createClient(url, key);

export default supabase;
