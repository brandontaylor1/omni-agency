require('dotenv').config({ path: '.env.local' });

console.log('Starting database migrations...');
console.log('Please open the Supabase dashboard, go to the SQL Editor, and run the following SQL:');

const fullSql = `
-- Create enums with proper error handling
DO $$
BEGIN
  -- Create role enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
    CREATE TYPE role AS ENUM ('owner', 'admin', 'agent', 'staff', 'analyst', 'read_only');
  END IF;

  -- Create player_level enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'player_level') THEN
    CREATE TYPE player_level AS ENUM ('hs', 'college', 'nfl');
  END IF;

  -- Create value_tier enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'value_tier') THEN
    CREATE TYPE value_tier AS ENUM ('tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5');
  END IF;

  -- Create comm_channel enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comm_channel') THEN
    CREATE TYPE comm_channel AS ENUM ('phone', 'sms', 'email', 'in_person', 'social');
  END IF;

  -- Create comm_direction enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comm_direction') THEN
    CREATE TYPE comm_direction AS ENUM ('inbound', 'outbound');
  END IF;
END
$$;

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

console.log('\nAfter creating the schema, you can create a sample organization using:');

const sampleOrgSql = `
INSERT INTO organizations (name, slug, settings)
VALUES ('Sample Agency', 'sample-agency', '{"brandColor": "#4F46E5"}');
`;

console.log(sampleOrgSql);
