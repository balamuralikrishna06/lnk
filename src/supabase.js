import supabase from './lib/supabaseClient';

export { supabase };

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
