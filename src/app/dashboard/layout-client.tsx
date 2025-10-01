'use client';

import { User } from '@supabase/supabase-js';
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import ClientProviders from '@/components/client-providers';
import { cn } from "@/lib/utils";
import { useState } from 'react';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: User;
  organizations: any[];  // Type this properly based on your organization type
}

export default function DashboardLayoutClient({
  children,
  user,
  organizations
}: DashboardLayoutClientProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ClientProviders>
      <div className="min-h-screen">
        <Header user={user} />
        <div className="flex h-[calc(100vh-4rem)]">
          <Sidebar
            organizations={organizations}
            onCollapsedChange={setIsSidebarCollapsed}
          />
          <main className={cn(
            "flex-1 transition-all duration-300",
            isSidebarCollapsed ? "ml-[100px]" : "ml-[240px]"
          )}>
            {children}
          </main>
        </div>
      </div>
    </ClientProviders>
  );
}
