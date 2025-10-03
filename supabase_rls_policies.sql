-- Enable Row Level Security on the contacts table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view contacts in their organization
CREATE POLICY "Users can view contacts in their organization"
ON contacts
FOR SELECT
USING (
  org_id IN (
    SELECT org_id FROM org_members 
    WHERE user_id = auth.uid()
  )
);

-- Create policy for users to insert contacts in their organization
CREATE POLICY "Users can insert contacts in their organization"
ON contacts
FOR INSERT
WITH CHECK (
  org_id IN (
    SELECT org_id FROM org_members 
    WHERE user_id = auth.uid()
  )
);

-- Create policy for users to update contacts in their organization
CREATE POLICY "Users can update contacts in their organization"
ON contacts
FOR UPDATE
USING (
  org_id IN (
    SELECT org_id FROM org_members 
    WHERE user_id = auth.uid()
  )
);

-- Create policy for users to delete contacts in their organization
CREATE POLICY "Users can delete contacts in their organization"
ON contacts
FOR DELETE
USING (
  org_id IN (
    SELECT org_id FROM org_members 
    WHERE user_id = auth.uid()
  )
);

-- Update org_members table to support new roles and invitation metadata
ALTER TABLE org_members
    ALTER COLUMN role TYPE text USING role::text, -- Change to text for flexibility
    ALTER COLUMN role SET DEFAULT 'support_staff', -- Default to lowest privilege
    ADD COLUMN invited_by uuid REFERENCES users(id),
    ADD COLUMN invited_at timestamptz,
    ADD COLUMN joined_at timestamptz;

-- Create organization_invitations table
CREATE TABLE IF NOT EXISTS organization_invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid REFERENCES organizations(id) NOT NULL,
    email text NOT NULL,
    role text NOT NULL,
    invited_by uuid REFERENCES users(id) NOT NULL,
    token text UNIQUE NOT NULL,
    expires_at timestamptz NOT NULL,
    accepted_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Add indexes for invitations
CREATE INDEX IF NOT EXISTS idx_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON organization_invitations(email);
