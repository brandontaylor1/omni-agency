import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/sidebar';
import Header from '@/components/dashboard/header';
import ClientProviders from '@/components/client-providers';

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
    <ClientProviders>
      <div className="flex h-screen overflow-hidden">
        <Sidebar organizations={organizations} />
        <div className="flex flex-col flex-1 overflow-hidden md:pl-64">
          <Header user={session.user} />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ClientProviders>
  );
}
