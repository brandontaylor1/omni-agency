-- First, drop the problematic policies
DROP POLICY IF EXISTS org_members_select ON org_members;
DROP POLICY IF EXISTS org_members_insert ON org_members;
DROP POLICY IF EXISTS org_members_update ON org_members;
DROP POLICY IF EXISTS org_members_delete ON org_members;

-- Recreate the policies with proper logic to avoid recursion
-- Basic select policy: users can view members of organizations they belong to
CREATE POLICY org_members_select ON org_members
    FOR SELECT USING (
        -- Allow viewing org_members rows where the user is a member of the organization
        EXISTS (
            SELECT 1 FROM organizations o
            WHERE o.id = org_members.org_id
            AND EXISTS (
                SELECT 1 FROM org_members my_membership
                WHERE my_membership.org_id = o.id
                AND my_membership.user_id = auth.uid()
            )
        )
    );

-- Insert policy: only owners and director_admins can add members
CREATE POLICY org_members_insert ON org_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM org_members my_role
            WHERE my_role.org_id = org_members.org_id
            AND my_role.user_id = auth.uid()
            AND my_role.role IN ('owner', 'director_admin')
        )
    );

-- Update policy: only owners and director_admins can update members
CREATE POLICY org_members_update ON org_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM org_members my_role
            WHERE my_role.org_id = org_members.org_id
            AND my_role.user_id = auth.uid()
            AND my_role.role IN ('owner', 'director_admin')
        )
    );

-- Delete policy: only owners can remove members
CREATE POLICY org_members_delete ON org_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM org_members my_role
            WHERE my_role.org_id = org_members.org_id
            AND my_role.user_id = auth.uid()
            AND my_role.role = 'owner'
        )
    );

-- Grant access to authenticated users
GRANT ALL ON org_members TO authenticated;
