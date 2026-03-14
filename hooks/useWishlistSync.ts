import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useWishlistStore } from '@/store/wishlistStore';
import { isCustomerSession } from '@/lib/customerSession';

/**
 * Syncs the Zustand wishlist store with the DB.
 * - On login as customer: fetches DB wishlist → sets store (+ merges any local items)
 * - On logout: clears the store
 * Call this once from a high-level component (e.g. Navbar or Layout).
 */
export function useWishlistSync() {
  const { data: session, status } = useSession();
  const setItems = useWishlistStore((state) => state.setItems);
  const localItems = useWishlistStore((state) => state.items);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const syncedRef = useRef<string | null>(null); // tracks the last synced userId

  useEffect(() => {
    if (status === 'loading') return;

    // ── Logged OUT ────────────────────────────────────────────────
    if (!isCustomerSession(session)) {
      // Clear store on logout so a different user's wishlist isn't shown
      if (syncedRef.current) {
        clearWishlist();
        syncedRef.current = null;
      }
      return;
    }

    const userId = (session?.user as any)?.id;
    if (!userId) return;

    // Already synced for this user — don't re-fetch
    if (syncedRef.current === userId) return;

    const syncWithDB = async () => {
      try {
        // If there are local items (guest wishlist), merge them into DB first
        if (localItems.length > 0) {
          await fetch('/api/wishlist/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: localItems }),
          });
        }

        // Fetch the definitive DB wishlist and update the store
        const res = await fetch('/api/wishlist');
        if (res.ok) {
          const data = await res.json();
          const ids: string[] = (data.productIds ?? []).map((p: any) =>
            typeof p === 'string' ? p : p._id?.toString() ?? p
          );
          setItems(ids);
          syncedRef.current = userId;
        }
      } catch (err) {
        console.error('[WishlistSync] error:', err);
      }
    };

    syncWithDB();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);
}
