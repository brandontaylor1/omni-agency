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

// Helper function to execute raw SQL using the REST API
async function executeSql(sql: string): Promise<{ data?: any; error?: { message: string } }> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'params=single-object'
    };

    if (supabaseKey) {
      headers['apikey'] = supabaseKey;
    }

    const response: Response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: sql
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Check if error is about existing objects (not a real error for our purpose)
      if (errorText.includes('already exists')) {
        return { error: { message: 'already exists' } };
      }
      throw new Error(`SQL execution failed: ${errorText}`);
    }

    return { data: await response.json(), error: undefined };
  } catch (error: any) {
    if (error.message && error.message.includes('already exists')) {
      return { error: { message: 'already exists' } };
    }
    console.error('SQL execution error:', error);
    return { error: { message: error.message || 'Unknown error' } };
  }
}

async function runMigration(): Promise<void> {
  console.log('Starting database migrations...');

  try {
    // A simpler approach: let's use the Supabase UI SQL Editor
    console.log('\nNOTE: Due to limitations with the JavaScript client, you may need to execute SQL directly in the Supabase dashboard SQL Editor.');
    console.log('Please copy and execute the following SQL in your Supabase SQL Editor:\n');

    const fullSql = `
-- Create enums
CREATE TYPE IF NOT EXISTS role AS ENUM ('owner', 'admin', 'agent', 'staff', 'analyst', 'read_only');
CREATE TYPE IF NOT EXISTS player_level AS ENUM ('hs', 'college', 'nfl');
CREATE TYPE IF NOT EXISTS value_tier AS ENUM ('tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5');
CREATE TYPE IF NOT EXISTS comm_channel AS ENUM ('phone', 'sms', 'email', 'in_person', 'social');
CREATE TYPE IF NOT EXISTS comm_direction AS ENUM ('inbound', 'outbound');

-- Create tables
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS org_members (
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role role NOT NULL DEFAULT 'read_only',
  PRIMARY KEY (org_id, user_id)
);

-- Create helper function for RLS
CREATE OR REPLACE FUNCTION is_org_member(target_org uuid)
RETURNS boolean
LANGUAGE sql
STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members m
    WHERE m.org_id = target_org AND m.user_id = auth.uid()
  );
$$;

-- Enable RLS on tables and create policies
DO $$
BEGIN
  -- Enable RLS on organizations table
  ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

  -- Create view policy for organizations if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'organizations' AND policyname = 'Users can view organizations they belong to'
  ) THEN
    CREATE POLICY "Users can view organizations they belong to" 
    ON organizations FOR SELECT 
    USING (is_org_member(id));
  END IF;

  -- Create insert policy for organizations if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'organizations' AND policyname = 'Authenticated users can create organizations'
  ) THEN
    CREATE POLICY "Authenticated users can create organizations" 
    ON organizations FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;

  -- Create update policy for organizations if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'organizations' AND policyname = 'Organization owners can update their organization'
  ) THEN
    CREATE POLICY "Organization owners can update their organization" 
    ON organizations FOR UPDATE 
    USING (
      EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = organizations.id 
        AND user_id = auth.uid() 
        AND role = 'owner'
      )
    );
  END IF;

  -- Enable RLS on org_members table
  ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

  -- Create view policy for org_members if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'org_members' AND policyname = 'Users can view members of their organization'
  ) THEN
    CREATE POLICY "Users can view members of their organization" 
    ON org_members FOR SELECT 
    USING (is_org_member(org_id));
  END IF;

  -- Create admin policy for org_members if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'org_members' AND policyname = 'Organization admins can manage members'
  ) THEN
    CREATE POLICY "Organization admins can manage members" 
    ON org_members FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = org_members.org_id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'admin')
      )
    );
  END IF;
END
$$;
`;

    console.log(fullSql);

    console.log('\nAlternatively, you can create these tables using simpler SQL statements one by one.');

    console.log('\nNOTE: Direct schema manipulation is not fully supported through the Supabase JavaScript client.');
    console.log('Please open the Supabase dashboard, go to the SQL Editor, and run the SQL statements above.');

    // Create a sample organization for testing
    console.log('\nOnce the schema is created, you can create a sample organization using:');

    const sampleOrgSql = `
INSERT INTO organizations (name, slug, settings)
VALUES ('Sample Agency', 'sample-agency', '{"brandColor": "#4F46E5"}');
`;

    console.log(sampleOrgSql);

    console.log('\nMigration guidance completed. Please use the Supabase SQL Editor to execute the statements.');
  } catch (error: any) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigration();
