'use client';

import { User } from '@supabase/supabase-js';
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import ClientProviders from '@/components/client-providers';
import { cn } from "@/lib/utils";
import { useState } from 'react';
import NewsPanel from "@/components/dashboard/news-panel";

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
  const [isNewsCollapsed, setIsNewsCollapsed] = useState(false);

  return (
    <ClientProviders>
      <div className="h-[100vh]">
        <Header user={user} newsPanelOpen={!isNewsCollapsed} newsPanelWidth={!isNewsCollapsed ? 400 : 0} />
        <div className="flex h-[calc(100vh-4rem)]">
          <Sidebar
            organizations={organizations}
            onCollapsedChange={setIsSidebarCollapsed}
          />
          <main className={cn(
            "flex-1 h-full transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "ml-[100px]" : "ml-[240px]",
            !isNewsCollapsed ? "mr-[400px]" : "mr-0"
          )}>
            {children}
          </main>
          <NewsPanel collapsed={isNewsCollapsed} onToggle={() => setIsNewsCollapsed(!isNewsCollapsed)} />
        </div>
      </div>
    </ClientProviders>
  );
}
