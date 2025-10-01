-- Create the contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  title TEXT,
  company TEXT,
  department TEXT,
  contact_type TEXT,
  image_url TEXT,
  website TEXT,
  location TEXT,
  notes TEXT,
  last_contact_date DATE,
  athletes_count INTEGER,
  events_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_type ON contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);
CREATE INDEX IF NOT EXISTS idx_contacts_last_contact_date ON contacts(last_contact_date);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add row-level security policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy to restrict contacts to their organization
CREATE POLICY organization_contacts_policy ON contacts
FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM org_members
  WHERE user_id = auth.uid()
));

-- Add some example data for testing
INSERT INTO contacts (
  organization_id,
  first_name,
  last_name,
  email,
  phone,
  title,
  company,
  department,
  contact_type,
  location,
  notes,
  last_contact_date
)
SELECT 
  (SELECT id FROM organizations LIMIT 1),
  unnest(ARRAY['John', 'Sarah', 'Michael', 'Jennifer', 'Robert', 'Lisa', 'David', 'Emma']),
  unnest(ARRAY['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson']),
  unnest(ARRAY['john@example.com', 'sarah@example.com', 'michael@example.com', 'jennifer@example.com', 'robert@example.com', 'lisa@example.com', 'david@example.com', 'emma@example.com']),
  unnest(ARRAY['(555) 123-4567', '(555) 234-5678', '(555) 345-6789', '(555) 456-7890', '(555) 567-8901', '(555) 678-9012', '(555) 789-0123', '(555) 890-1234']),
  unnest(ARRAY['Sports Agent', 'Marketing Director', 'Head Coach', 'Media Relations', 'Talent Scout', 'Brand Manager', 'Team Manager', 'Sponsor Relations']),
  unnest(ARRAY['Elite Sports Agency', 'Global Marketing Inc', 'State University', 'Sports Network', 'Pro Scouts LLC', 'Major Brand Corp', 'City Team', 'Sponsor Company']),
  unnest(ARRAY['Agency', 'Marketing', 'Coaching', 'Media', 'Scouting', 'Brand Management', 'Team Management', 'Sponsorship']),
  unnest(ARRAY['Agent', 'Business', 'Coach', 'Media', 'Agent', 'Sponsor', 'Team', 'Sponsor']),
  unnest(ARRAY['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Atlanta, GA', 'Dallas, TX', 'Miami, FL', 'Seattle, WA', 'Boston, MA']),
  unnest(ARRAY['Key agent for football players', 'Handles marketing deals for elite athletes', 'Former NFL coach with great connections', 'Contact for media appearances', 'Focuses on college talent', 'Manages athlete endorsements', 'Decision maker for team signings', 'Manages sponsorship opportunities']),
  unnest(ARRAY['2023-01-15', '2023-02-20', '2023-03-10', '2023-04-05', '2023-05-12', '2023-06-18', '2023-07-22', '2023-08-30']::date[])
WHERE EXISTS (SELECT 1 FROM organizations LIMIT 1);

COMMENT ON TABLE contacts IS 'Stores contact information for people related to athletes and organizations';
