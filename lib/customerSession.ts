import type { Session } from 'next-auth';

/**
 * Admin login is separate from the store. On the website (store), we only
 * consider the user "logged in" when they have a customer session (not admin).
 * Use this everywhere on the store frontend and in customer-only API routes.
 */
export function isCustomerSession(session: Session | null | undefined): boolean {
  if (!session?.user) return false;
  return (session.user as { role?: string }).role !== 'admin';
}
