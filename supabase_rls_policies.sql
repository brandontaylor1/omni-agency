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
