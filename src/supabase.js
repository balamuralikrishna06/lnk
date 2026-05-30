import { createClient } from '@supabase/supabase-js';

// Read environmental variables. If not defined, fallback to mock values to prevent application crashes during local development.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * DATABASE SCHEMA REFERENCE
 * 
 * To set up your Supabase database, run the following SQL query in your Supabase SQL Editor:
 * 
 * CREATE TABLE gifts (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
 *   donor_name TEXT NOT NULL,
 *   amount NUMERIC, -- Nullable for physical gifts
 *   gift_name TEXT NOT NULL, -- Name of the gift (e.g. "$500" or "Espresso Machine")
 *   gift_type TEXT CHECK (gift_type IN ('cash', 'physical')) NOT NULL,
 *   thank_you_status TEXT CHECK (thank_you_status IN ('pending', 'sent')) DEFAULT 'pending' NOT NULL,
 *   registry_item_name TEXT NOT NULL -- e.g., "Honeymoon Fund" or "Registry Item"
 * );
 */
