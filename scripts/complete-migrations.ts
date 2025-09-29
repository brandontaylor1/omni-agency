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
  console.log('Starting complete database migration...');

  try {
    console.log('Please copy and execute the following SQL in your Supabase SQL Editor:\n');

    const completeSql = `
-- Create enums
CREATE TYPE IF NOT EXISTS role AS ENUM ('owner', 'admin', 'agent', 'staff', 'analyst', 'read_only');
CREATE TYPE IF NOT EXISTS player_level AS ENUM ('hs', 'college', 'nfl');
CREATE TYPE IF NOT EXISTS value_tier AS ENUM ('tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5');
CREATE TYPE IF NOT EXISTS comm_channel AS ENUM ('phone', 'sms', 'email', 'in_person', 'social');
CREATE TYPE IF NOT EXISTS comm_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE IF NOT EXISTS contract_type AS ENUM ('endorsement', 'nil', 'professional');
CREATE TYPE IF NOT EXISTS contract_status AS ENUM ('draft', 'pending', 'active', 'expired', 'terminated');

-- Create trigger function for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create org_members table
CREATE TABLE IF NOT EXISTS org_members (
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role role NOT NULL DEFAULT 'read_only',
  PRIMARY KEY (org_id, user_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create athletes table
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

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  partner text NOT NULL,
  type contract_type NOT NULL,
  value numeric(12, 2) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status contract_status NOT NULL DEFAULT 'draft',
  payment_schedule jsonb DEFAULT '[]'::jsonb,
  terms_document_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,

  CONSTRAINT contracts_dates_check CHECK (end_date >= start_date)
);

-- Create contract_payments table
CREATE TABLE IF NOT EXISTS contract_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  amount numeric(12, 2) NOT NULL,
  due_date date NOT NULL,
  paid_date date,
  status text NOT NULL DEFAULT 'pending',
  notes text
);

-- Create update triggers
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_members_updated_at
BEFORE UPDATE ON org_members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athletes_updated_at
BEFORE UPDATE ON athletes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON contracts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_payments_updated_at
BEFORE UPDATE ON contract_payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizations
CREATE POLICY "Users can view organizations they belong to" 
ON organizations FOR SELECT 
USING (is_org_member(id));

CREATE POLICY "Authenticated users can create organizations" 
ON organizations FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

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

-- Create RLS policies for users
CREATE POLICY "Users can view their own data" 
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
ON users FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Service role can manage all users" 
ON users FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view other users in their organizations" 
ON users FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM org_members m1
    JOIN org_members m2 ON m1.org_id = m2.org_id
    WHERE m1.user_id = auth.uid() AND m2.user_id = users.id
  )
);

-- Create RLS policies for org_members
CREATE POLICY "Users can view members of their organization" 
ON org_members FOR SELECT 
USING (is_org_member(org_id));

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

-- Create RLS policies for athletes
CREATE POLICY "Users can view athletes in their organization"
ON athletes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM org_members
    WHERE org_members.org_id = athletes.org_id
    AND org_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create athletes in their organization"
ON athletes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM org_members
    WHERE org_members.org_id = athletes.org_id
    AND org_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update athletes in their organization"
ON athletes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM org_members
    WHERE org_members.org_id = athletes.org_id
    AND org_members.user_id = auth.uid()
  )
);

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

-- Create RLS policies for contracts
CREATE POLICY "Users can view contracts from their organizations"
ON contracts FOR SELECT
USING (is_org_member(org_id));

CREATE POLICY "Users can insert contracts in their organizations"
ON contracts FOR INSERT
WITH CHECK (is_org_member(org_id));

CREATE POLICY "Organization members can update their contracts"
ON contracts FOR UPDATE
USING (is_org_member(org_id));

CREATE POLICY "Organization admins can delete contracts"
ON contracts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = contracts.org_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- Create RLS policies for contract_payments
CREATE POLICY "Users can view contract payments from their organizations"
ON contract_payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM contracts c
    JOIN org_members m ON c.org_id = m.org_id
    WHERE contract_payments.contract_id = c.id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert contract payments in their organizations"
ON contract_payments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM contracts c
    JOIN org_members m ON c.org_id = m.org_id
    WHERE contract_payments.contract_id = c.id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can update their contract payments"
ON contract_payments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM contracts c
    JOIN org_members m ON c.org_id = m.org_id
    WHERE contract_payments.contract_id = c.id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Organization admins can delete contract payments"
ON contract_payments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM contracts c
    JOIN org_members m ON c.org_id = m.org_id
    WHERE contract_payments.contract_id = c.id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin')
  )
);
`;

    console.log(completeSql);

    console.log('\nComplete migration script completed. Please execute the SQL in your Supabase dashboard.');
  } catch (error: any) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigration();
