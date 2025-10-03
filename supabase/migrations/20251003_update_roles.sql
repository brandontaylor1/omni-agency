-- Step 1: Drop views that depend on org_members.role
DROP VIEW IF EXISTS my_organizations;

-- Step 2: Drop policies on athletes table
DROP POLICY IF EXISTS athletes_delete_policy ON athletes;
DROP POLICY IF EXISTS athletes_insert_policy ON athletes;
DROP POLICY IF EXISTS athletes_org_isolation ON athletes;
DROP POLICY IF EXISTS athletes_update_policy ON athletes;

-- Step 3: Update org_members table
ALTER TABLE org_members
    ALTER COLUMN role TYPE text USING role::text,
    ALTER COLUMN role SET DEFAULT 'support_staff',
    ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS invited_at timestamptz,
    ADD COLUMN IF NOT EXISTS joined_at timestamptz;

-- Step 4: Recreate my_organizations view
CREATE OR REPLACE VIEW my_organizations AS
SELECT o.*, om.role
FROM organizations o
JOIN org_members om ON o.id = om.org_id
WHERE om.user_id = auth.uid();

-- Step 5: Recreate athletes policies
CREATE POLICY athletes_org_isolation ON athletes
    FOR ALL
    USING (
        org_id IN (
            SELECT org_id FROM org_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY athletes_insert_policy ON athletes
    FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'director_admin', 'director')
        )
    );

CREATE POLICY athletes_update_policy ON athletes
    FOR UPDATE
    USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'director_admin', 'director')
        )
    );

CREATE POLICY athletes_delete_policy ON athletes
    FOR DELETE
    USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'director_admin')
        )
    );

-- Step 6: Create organization_invitations table and indexes
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

CREATE INDEX IF NOT EXISTS idx_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON organization_invitations(email);

-- Step 7: Enable RLS on org_members and create basic policies
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_members_select ON org_members
    FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM org_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY org_members_insert ON org_members
    FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'director_admin')
        )
    );

CREATE POLICY org_members_update ON org_members
    FOR UPDATE
    USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'director_admin')
        )
    );

CREATE POLICY org_members_delete ON org_members
    FOR DELETE
    USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid()
            AND role = 'owner'
        )
    );
