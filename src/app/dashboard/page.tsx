import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();

  // Get user's organizations
  const { data: orgMemberships } = await supabase
    .from('org_members')
    .select('organization:organizations(*)')
    .eq('user_id', user?.id);

  const organizations = orgMemberships?.map(membership => membership.organization) || [];
  const currentOrg = organizations[0]; // For now, use the first organization

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your {currentOrg?.name || 'agency'} dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <h3 className="text-lg font-semibold">Athletes</h3>
            </div>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Get started by adding your first athlete
            </p>
          </div>
          <div className="bg-muted/50 px-6 py-3">
            <a href="/dashboard/athletes" className="text-sm underline font-medium">
              View all athletes
            </a>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-muted-foreground"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <h3 className="text-lg font-semibold">Contacts</h3>
            </div>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Add key contacts for your agency
            </p>
          </div>
          <div className="bg-muted/50 px-6 py-3">
            <a href="/dashboard/contacts" className="text-sm underline font-medium">
              View all contacts
            </a>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-muted-foreground"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
              <h3 className="text-lg font-semibold">Upcoming</h3>
            </div>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No upcoming events today, {formatDate(new Date())}
            </p>
          </div>
          <div className="bg-muted/50 px-6 py-3">
            <a href="/dashboard/calendar" className="text-sm underline font-medium">
              View calendar
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Add your first athlete</h4>
                <p className="text-sm text-muted-foreground">
                  Create athlete profiles to track their performance, contracts, and development.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Import contacts</h4>
                <p className="text-sm text-muted-foreground">
                  Add key contacts like coaches, scouts, and brand representatives.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Invite team members</h4>
                <p className="text-sm text-muted-foreground">
                  Add your colleagues to collaborate on athlete management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
