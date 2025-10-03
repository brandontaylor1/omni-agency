import { supabase } from './supabase/client';
import { ORGANIZATION_ROLES, OrganizationRole } from './roles';

export type InvitationData = {
  orgId: string;
  email: string;
  role: OrganizationRole;
  invitedBy: string;
};

export async function inviteUserToOrganization({
  orgId,
  email,
  role,
  invitedBy
}: InvitationData) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const { data, error } = await supabase
    .from('organization_invitations')
    .insert({
      org_id: orgId,
      email,
      role,
      invited_by: invitedBy,
      token,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInvitation(token: string) {
  const { data, error } = await supabase
    .from('organization_invitations')
    .select('*, organizations(*)')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) throw error;
  return data;
}

export async function acceptInvitation(token: string, userId: string) {
  const invitation = await getInvitation(token);
  if (!invitation) throw new Error('Invalid or expired invitation');

  const { error: memberError } = await supabase
    .from('org_members')
    .insert({
      org_id: invitation.org_id,
      user_id: userId,
      role: invitation.role,
      invited_by: invitation.invited_by,
      invited_at: invitation.created_at,
      joined_at: new Date().toISOString()
    });

  if (memberError) throw memberError;

  const { error: updateError } = await supabase
    .from('organization_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id);

  if (updateError) throw updateError;
  return invitation;
}
