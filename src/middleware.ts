import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/types/supabase';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If we're on a protected route and not logged in, redirect to login
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If we're on an auth route and logged in, redirect to dashboard
  if (session && (
    req.nextUrl.pathname.startsWith('/auth/login') || 
    req.nextUrl.pathname.startsWith('/auth/register')
  )) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Role-based access control for dashboard routes
  if (session && req.nextUrl.pathname.startsWith('/dashboard')) {
    // Example: extract org_id from query or session (customize as needed)
    const orgId = req.nextUrl.searchParams.get('org') || session.user.org_id;
    if (orgId) {
      // Fetch org_membership for this user
      const { data: orgMember, error: orgMemberError } = await supabase
        .from('org_members')
        .select('role')
        .eq('org_id', orgId)
        .eq('user_id', session.user.id)
        .single();
      if (!orgMember || orgMemberError) {
        // Not a member of this org, redirect to dashboard home
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      // Example: restrict access to athlete edit page to certain roles
      if (
        req.nextUrl.pathname.includes('/athletes/') &&
        req.nextUrl.pathname.includes('/edit') &&
        !['owner', 'director_admin', 'director'].includes(orgMember.role)
      ) {
        // Insufficient permission
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      // Add more route/role checks as needed
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/login',
    '/auth/register',
  ],
};
