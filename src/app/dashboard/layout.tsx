import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import DashboardLayoutClient from './layout-client';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  // Get user's organizations
  const { data: orgMemberships } = await supabase
    .from('org_members')
    .select('organization:organizations(*)')
    .eq('user_id', session.user.id);

  const organizations = orgMemberships?.map(membership => membership.organization) || [];

  return (
    <DashboardLayoutClient
      user={session.user}
      organizations={organizations}
    >
      {children}
    </DashboardLayoutClient>
  );
}
