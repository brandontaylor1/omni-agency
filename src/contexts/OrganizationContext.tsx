'use client';

// src/contexts/OrganizationContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';

type OrganizationContextType = {
    organizationId: string | null;
    organizationName: string | null;
    userRole: string | null;
    isLoading: boolean;
    refreshOrganization: () => Promise<void>;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const [organizationId, setOrganizationId] = useState<string | null>(null);
    const [organizationName, setOrganizationName] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrganizationData = async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                // Use API route instead of direct database query to avoid RLS recursion
                const response = await fetch('/api/user/organization', {
                    credentials: 'include' // Make sure cookies are sent with the request
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API error:', errorData);
                    throw new Error(errorData.error || 'Failed to fetch organization data');
                }

                const data = await response.json();

                if (data.organizationId) {
                    setOrganizationId(data.organizationId);
                    setOrganizationName(data.organizationName);
                    setUserRole(data.userRole);
                } else {
                    console.warn('No organization found for user');
                }
            } catch (err) {
                console.error('Error fetching organization data:', err);
                // Clear organization data on error
                setOrganizationId(null);
                setOrganizationName(null);
                setUserRole(null);
            }
        } catch (error) {
            console.error('Error in fetchOrganizationData:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // No fallback method - API route is the only way to fetch organization data

    // Initial fetch
    useEffect(() => {
        fetchOrganizationData();

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchOrganizationData();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const value = {
        organizationId,
        organizationName,
        userRole,
        isLoading,
        refreshOrganization: fetchOrganizationData
    };

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
}