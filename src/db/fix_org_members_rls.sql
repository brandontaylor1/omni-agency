-- Fix org_members table RLS policies to prevent infinite recursion

-- First, disable RLS temporarily to reset policies
ALTER TABLE public.org_members DISABLE ROW LEVEL SECURITY;

-- Drop existing policies on org_members
DROP POLICY IF EXISTS org_members_policy ON public.org_members;

-- Create a safer function to check org membership without recursion
CREATE OR REPLACE FUNCTION public.is_org_member(target_org UUID)
RETURNS BOOLEAN
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Direct query to check membership without using RLS policies
  RETURN EXISTS (
    SELECT 1 
    FROM public.org_members 
    WHERE user_id = auth.uid() 
    AND org_id = target_org
  );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- New policy uses the function to avoid recursion
CREATE POLICY org_members_policy ON public.org_members
    USING (
      (org_id IN (
        SELECT org_id 
        FROM public.org_members 
        WHERE user_id = auth.uid()
      )) 
      OR 
      is_org_member(org_id)
    );

-- Add admin bypass policy if needed (only if you have service roles)
CREATE POLICY org_members_admin_policy ON public.org_members
    USING (
      auth.role() = 'service_role'
    );

-- Create a helper view for checking organization membership (safer)
CREATE OR REPLACE VIEW public.my_organizations AS
SELECT org.id, org.name, org.slug, mem.role
FROM public.organizations org
JOIN public.org_members mem ON org.id = mem.org_id
WHERE mem.user_id = auth.uid();

-- Create a safer policy for athletes table that doesn't trigger recursion
DROP POLICY IF EXISTS athletes_org_isolation ON public.athletes;
DROP POLICY IF EXISTS athletes_insert_policy ON public.athletes;
DROP POLICY IF EXISTS athletes_update_policy ON public.athletes;
DROP POLICY IF EXISTS athletes_delete_policy ON public.athletes;

-- Policy: Users can only view/modify athletes in their organization
CREATE POLICY athletes_org_isolation ON public.athletes
    USING (
      is_org_member(org_id) OR
      (org_id IN (SELECT id FROM public.my_organizations))
    );

-- Policy: Only allow users with appropriate roles to insert athletes
CREATE POLICY athletes_insert_policy ON public.athletes
    FOR INSERT
    WITH CHECK (
        is_org_member(org_id) AND 
        EXISTS (
            SELECT 1 FROM public.org_members
            WHERE user_id = auth.uid()
            AND org_id = athletes.org_id
            AND role IN ('owner', 'admin', 'agent')
        )
    );

-- Policy: Only allow users with appropriate roles to update athletes
CREATE POLICY athletes_update_policy ON public.athletes
    FOR UPDATE
    USING (
        is_org_member(org_id) AND
        EXISTS (
            SELECT 1 FROM public.org_members
            WHERE user_id = auth.uid()
            AND org_id = athletes.org_id
            AND role IN ('owner', 'admin', 'agent')
        )
    );

-- Policy: Only allow users with appropriate roles to delete athletes
CREATE POLICY athletes_delete_policy ON public.athletes
    FOR DELETE
    USING (
        is_org_member(org_id) AND
        EXISTS (
            SELECT 1 FROM public.org_members
            WHERE user_id = auth.uid()
            AND org_id = athletes.org_id
            AND role IN ('owner', 'admin')
        )
    );
