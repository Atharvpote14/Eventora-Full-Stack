"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { wishlistService } from "@/services/user";

interface WishlistContextValue {
  ids: Set<string>;
  loading: boolean;
  isWishlisted: (eventId: string) => boolean;
  toggle: (eventId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, initialized } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const items = await wishlistService.list();
      setIds(new Set(items.map((item) => item.event._id)));
    } catch {
      setIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!initialized) return;
    let cancelled = false;
    (async () => {
      if (!user) {
        if (!cancelled) setIds(new Set());
        return;
      }
      try {
        const items = await wishlistService.list();
        if (!cancelled) setIds(new Set(items.map((item) => item.event._id)));
      } catch {
        if (!cancelled) setIds(new Set());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialized, user]);

  const isWishlisted = useCallback((eventId: string) => ids.has(eventId), [ids]);

  const toggle = useCallback(
    async (eventId: string) => {
      if (ids.has(eventId)) {
        await wishlistService.remove(eventId);
        setIds((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
      } else {
        await wishlistService.add(eventId);
        setIds((prev) => new Set(prev).add(eventId));
      }
    },
    [ids],
  );

  const value = useMemo(
    () => ({ ids, loading, isWishlisted, toggle, refresh }),
    [ids, loading, isWishlisted, toggle, refresh],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}