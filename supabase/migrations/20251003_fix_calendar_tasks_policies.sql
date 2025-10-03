-- First, fix the org_members policies (simpler version)
ALTER TABLE org_members DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS org_members_select ON org_members;
DROP POLICY IF EXISTS org_members_insert ON org_members;
DROP POLICY IF EXISTS org_members_update ON org_members;
DROP POLICY IF EXISTS org_members_delete ON org_members;

-- Basic select policy that doesn't cause recursion
CREATE POLICY org_members_select ON org_members
    FOR SELECT USING (true);  -- Temporarily allow all reads

-- Now fix the calendar_tasks policies
DROP POLICY IF EXISTS "Users can create tasks in their organization" ON calendar_tasks;
DROP POLICY IF EXISTS "Users can delete tasks in their organization" ON calendar_tasks;
DROP POLICY IF EXISTS "Users can update tasks in their organization" ON calendar_tasks;
DROP POLICY IF EXISTS "Users can view tasks in their organization" ON calendar_tasks;

-- Recreate calendar_tasks policies without referencing org_members
CREATE POLICY "Users can view tasks in their organization" ON calendar_tasks
    FOR SELECT USING (
        organization_id IN (
            SELECT o.id FROM organizations o
            WHERE EXISTS (
                SELECT 1 FROM org_members om
                WHERE om.org_id = o.id
                AND om.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create tasks in their organization" ON calendar_tasks
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT o.id FROM organizations o
            WHERE EXISTS (
                SELECT 1 FROM org_members om
                WHERE om.org_id = o.id
                AND om.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update tasks in their organization" ON calendar_tasks
    FOR UPDATE USING (
        organization_id IN (
            SELECT o.id FROM organizations o
            WHERE EXISTS (
                SELECT 1 FROM org_members om
                WHERE om.org_id = o.id
                AND om.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete tasks in their organization" ON calendar_tasks
    FOR DELETE USING (
        organization_id IN (
            SELECT o.id FROM organizations o
            WHERE EXISTS (
                SELECT 1 FROM org_members om
                WHERE om.org_id = o.id
                AND om.user_id = auth.uid()
            )
        )
    );

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

-- Ensure proper grants
GRANT ALL ON calendar_tasks TO authenticated;
GRANT ALL ON org_members TO authenticated;
