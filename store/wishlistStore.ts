import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  setItems: (items: string[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (productId) => {
        if (!get().isInWishlist(productId)) {
          set((state) => ({ items: [...state.items, productId] }));
        }
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }));
      },
      
      toggleItem: (productId) => {
        if (get().isInWishlist(productId)) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },
      
      isInWishlist: (productId) => {
        return get().items.includes(productId);
      },
      
      clearWishlist: () => set({ items: [] }),
      
      setItems: (items) => set({ items }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
