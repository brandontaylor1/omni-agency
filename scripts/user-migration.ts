import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fetch, { Response, HeadersInit } from 'node-fetch';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration(): Promise<void> {
  console.log('Starting users table migration...');

  try {
    console.log('Please copy and execute the following SQL in your Supabase SQL Editor:\n');

    const usersSql = `
-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create trigger to update updated_at column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own data
CREATE POLICY "Users can view their own data" 
ON users FOR SELECT 
USING (auth.uid() = id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own data" 
ON users FOR UPDATE 
USING (auth.uid() = id);

-- Create policy to allow service role to manage all users
CREATE POLICY "Service role can manage all users" 
ON users FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Create policy to allow users to see other users in same organization
CREATE POLICY "Users can view other users in their organizations" 
ON users FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM org_members m1
    JOIN org_members m2 ON m1.org_id = m2.org_id
    WHERE m1.user_id = auth.uid() AND m2.user_id = users.id
  )
);

-- Create athletes table if needed
CREATE TABLE IF NOT EXISTS athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  current_team TEXT NOT NULL,
  position TEXT NOT NULL,
  jersey_number INTEGER,
  height_inches INTEGER,
  weight_lbs INTEGER,
  hometown TEXT,
  high_school TEXT,
  previous_colleges TEXT[],
  current_grade TEXT,
  nil_tier TEXT,
  nil_value NUMERIC,
  total_contract_value NUMERIC,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  image_url TEXT
);

-- Create trigger for athletes updated_at
CREATE TRIGGER update_athletes_updated_at
BEFORE UPDATE ON athletes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on athletes table
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow org members to view athletes
CREATE POLICY "Users can view athletes in their organization"
ON athletes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM org_members
    WHERE org_members.org_id = athletes.org_id
    AND org_members.user_id = auth.uid()
  )
);

-- Create policy to allow org members to create athletes
CREATE POLICY "Users can create athletes in their organization"
ON athletes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM org_members
    WHERE org_members.org_id = athletes.org_id
    AND org_members.user_id = auth.uid()
  )
);

-- Create policy to allow org members to update athletes
CREATE POLICY "Users can update athletes in their organization"
ON athletes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM org_members
    WHERE org_members.org_id = athletes.org_id
    AND org_members.user_id = auth.uid()
  )
);

-- Create policy to allow org admins/owners to delete athletes
CREATE POLICY "Admins can delete athletes in their organization"
ON athletes FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM org_members
    WHERE org_members.org_id = athletes.org_id
    AND org_members.user_id = auth.uid()
    AND org_members.role IN ('admin', 'owner')
  )
);
`;

    console.log(usersSql);

    console.log('\nMigration script for users table completed. Please execute the SQL in your Supabase dashboard.');
  } catch (error: any) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigration();
