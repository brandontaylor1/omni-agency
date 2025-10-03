'use client';

import { useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ORGANIZATION_ROLES } from '@/lib/roles';
import { inviteUserToOrganization } from '@/lib/invitations';
import { useOrganizationRole } from '@/hooks/useOrganizationRole';

export function MemberManagement({ orgId }: { orgId: string }) {
  const session = useSession();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('support_staff');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { hasPermission } = useOrganizationRole(orgId, session?.user?.id);

  if (!hasPermission('manage_members')) {
    return <div>You don't have permission to manage members.</div>;
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await inviteUserToOrganization({
        orgId,
        email,
        role: role as keyof typeof ORGANIZATION_ROLES,
        invitedBy: session?.user?.id as string
      });
      setEmail('');
      // TODO: Show success message
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-bold">Member Management</h2>

      <form onSubmit={handleInvite} className="space-y-4">
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Role
          </label>
          <Select
            value={role}
            onValueChange={setRole}
          >
            <Select.Option value={ORGANIZATION_ROLES.DIRECTOR_ADMIN}>
              Director Admin
            </Select.Option>
            <Select.Option value={ORGANIZATION_ROLES.DIRECTOR}>
              Director
            </Select.Option>
            <Select.Option value={ORGANIZATION_ROLES.AGENT}>
              Agent
            </Select.Option>
            <Select.Option value={ORGANIZATION_ROLES.SUPPORT_STAFF}>
              Support Staff
            </Select.Option>
          </Select>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
        </Button>
      </form>

      {/* TODO: Add MembersList component here */}
    </div>
  );
}
