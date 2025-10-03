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
    FOR INSERT TO authenticated
    WITH CHECK (
        org_id IN (
            SELECT om.org_id
            FROM org_members om
            WHERE om.user_id = auth.uid()
            AND om.role IN ('owner', 'director_admin')
        )
    );

-- Update policy for owners and director_admins
CREATE POLICY org_members_update ON org_members
    FOR UPDATE TO authenticated
    USING (
        org_id IN (
            SELECT om.org_id
            FROM org_members om
            WHERE om.user_id = auth.uid()
            AND om.role IN ('owner', 'director_admin')
        )
    );

-- Delete policy for owners only
CREATE POLICY org_members_delete ON org_members
    FOR DELETE TO authenticated
    USING (
        org_id IN (
            SELECT om.org_id
            FROM org_members om
            WHERE om.user_id = auth.uid()
            AND om.role = 'owner'
        )
    );

-- Re-enable RLS
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

-- Ensure proper grants
GRANT ALL ON org_members TO authenticated;
