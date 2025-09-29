import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create a server client using the new approach
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check authentication using getUser() which verifies the session with the server
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      // Use the safer view we created to avoid RLS recursion
      const { data: myOrg, error: viewError } = await supabase
        .from('my_organizations')
        .select('id, name, role')
        .single();

      if (viewError) {
        console.error('Error using my_organizations view:', viewError);

        // Fallback to a direct SQL query (bypass RLS entirely)
        const { data: rawData, error: sqlError } = await supabase
          .rpc('get_user_org_details', { user_uuid: user.id });

        if (sqlError || !rawData) {
          console.error('Fallback SQL query failed:', sqlError);
          return NextResponse.json({
            error: 'Could not retrieve organization data'
          }, { status: 500 });
        }

        return NextResponse.json({
          organizationId: rawData.org_id,
          organizationName: rawData.org_name,
          userRole: rawData.user_role
        });
      }

      if (!myOrg) {
        return NextResponse.json({ 
          message: 'User not associated with any organization'
        }, { status: 404 });
      }

      return NextResponse.json({
        organizationId: myOrg.id,
        organizationName: myOrg.name,
        userRole: myOrg.role
      });

    } catch (queryError: any) {
      console.error('Query error:', queryError);
      return NextResponse.json({ 
        error: 'Database query error' 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Unexpected error in organization API:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}
