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
  console.log('Starting contracts table migration...');

  try {
    console.log('Please copy and execute the following SQL in your Supabase SQL Editor:\n');

    const contractsSql = `
-- Create contract_type enum
CREATE TYPE IF NOT EXISTS contract_type AS ENUM ('endorsement', 'nil', 'professional');

-- Create contract_status enum
CREATE TYPE IF NOT EXISTS contract_status AS ENUM ('draft', 'pending', 'active', 'expired', 'terminated');

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

-- Create payments tracking table for contracts
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

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON contracts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_payments_updated_at
BEFORE UPDATE ON contract_payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for contracts table
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

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

-- Add RLS policies for contract_payments table
ALTER TABLE contract_payments ENABLE ROW LEVEL SECURITY;

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

    console.log(contractsSql);

    console.log('\nMigration script for contracts completed. Please execute the SQL in your Supabase dashboard.');
  } catch (error: any) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigration();
