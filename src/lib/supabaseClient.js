import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

// Clean and sanitize the URL (remove trailing /rest/v1 or /rest/v1/ and trailing slashes)
let sanitizedUrl = supabaseUrl.trim();
if (sanitizedUrl.endsWith('/rest/v1/')) {
  sanitizedUrl = sanitizedUrl.substring(0, sanitizedUrl.length - 9);
} else if (sanitizedUrl.endsWith('/rest/v1')) {
  sanitizedUrl = sanitizedUrl.substring(0, sanitizedUrl.length - 8);
}
sanitizedUrl = sanitizedUrl.replace(/\/+$/, '');

// Robust check to prevent crashes if placeholders are unmodified
const url = sanitizedUrl === 'YOUR_SUPABASE_PROJECT_URL' || !sanitizedUrl.startsWith('http')
  ? 'https://mock.supabase.co'
  : sanitizedUrl;

const key = supabaseAnonKey.trim() === 'YOUR_SUPABASE_ANON_KEY'
  ? 'mock-anon-key'
  : supabaseAnonKey.trim();

export const supabase = createClient(url, key);

export default supabase;
