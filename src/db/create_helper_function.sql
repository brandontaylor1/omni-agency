-- Create a helper function that bypasses RLS completely
-- This is used as a fallback in the API route

CREATE OR REPLACE FUNCTION public.get_user_org_details(user_uuid UUID)
RETURNS TABLE (
  org_id UUID, 
  org_name TEXT,
  user_role TEXT
) 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id AS org_id,
    o.name AS org_name,
    m.role AS user_role
  FROM
    public.organizations o
  JOIN
    public.org_members m ON o.id = m.org_id
  WHERE
    m.user_id = user_uuid
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_org_details TO authenticated;
