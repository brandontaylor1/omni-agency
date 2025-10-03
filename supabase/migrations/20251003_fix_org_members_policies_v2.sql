-- First, disable RLS temporarily to ensure we don't lock ourselves out
ALTER TABLE org_members DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS org_members_select ON org_members;
DROP POLICY IF EXISTS org_members_insert ON org_members;
DROP POLICY IF EXISTS org_members_update ON org_members;
DROP POLICY IF EXISTS org_members_delete ON org_members;

-- Create a simpler select policy first
CREATE POLICY org_members_select ON org_members
    FOR SELECT USING (
        -- User can see org_members entries if they are a member of that org
        org_id IN (
            SELECT org_id
            FROM org_members
            WHERE user_id = auth.uid()
        )
    );

-- Insert policy for owners and director_admins
CREATE POLICY org_members_insert ON org_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM org_members
            WHERE org_id = NEW.org_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'director_admin')
        )
    );

-- Update policy for owners and director_admins
CREATE POLICY org_members_update ON org_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM org_members
            WHERE org_id = org_members.org_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'director_admin')
        )
    );

-- Delete policy for owners only
CREATE POLICY org_members_delete ON org_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1
            FROM org_members
            WHERE org_id = org_members.org_id
            AND user_id = auth.uid()
            AND role = 'owner'
        )
    );

-- Re-enable RLS
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

-- Ensure proper grants
GRANT ALL ON org_members TO authenticated;
