'use client';

import { ReactNode } from 'react';
import { OrganizationProvider } from '@/contexts/OrganizationContext';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <OrganizationProvider>
      {children}
    </OrganizationProvider>
  );
}
