import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./auth-context";

const STORAGE_KEY = "topranker_bookmarks_v2";

export interface BookmarkEntry {
  id: string;
  name: string;
  slug: string;
  category: string;
  cuisine?: string; // Sprint 349: Optional cuisine for specific emoji
  savedAt: number;
}

interface BookmarksContextValue {
  bookmarks: Map<string, BookmarkEntry>;
  isBookmarked: (businessId: string) => boolean;
  toggleBookmark: (businessId: string, meta?: { name: string; slug: string; category: string; cuisine?: string }) => void;
  bookmarkCount: number;
  savedList: BookmarkEntry[];
}

const BookmarksContext = createContext<BookmarksContextValue>({
  bookmarks: new Map(),
  isBookmarked: () => false,
  toggleBookmark: () => {},
  bookmarkCount: 0,
  savedList: [],
});

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Map<string, BookmarkEntry>>(new Map());

  const storageKey = user ? `${STORAGE_KEY}_${user.id}` : STORAGE_KEY;

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((stored) => {
      if (stored) {
        try {
          const entries: BookmarkEntry[] = JSON.parse(stored);
          const map = new Map<string, BookmarkEntry>();
          entries.forEach(e => map.set(e.id, e));
          setBookmarks(map);
        } catch {}
      }
    });
  }, [storageKey]);

  const persist = useCallback((next: Map<string, BookmarkEntry>) => {
    AsyncStorage.setItem(storageKey, JSON.stringify([...next.values()]));
  }, [storageKey]);

  const isBookmarked = useCallback((businessId: string) => {
    return bookmarks.has(businessId);
  }, [bookmarks]);

  const toggleBookmark = useCallback((businessId: string, meta?: { name: string; slug: string; category: string }) => {
    setBookmarks(prev => {
      const next = new Map(prev);
      if (next.has(businessId)) {
        next.delete(businessId);
      } else if (meta) {
        next.set(businessId, { id: businessId, ...meta, savedAt: Date.now() });
      }
      persist(next);
      return next;
    });
  }, [persist]);

  const savedList = [...bookmarks.values()].sort((a, b) => b.savedAt - a.savedAt);

  return (
    <BookmarksContext.Provider value={{ bookmarks, isBookmarked, toggleBookmark, bookmarkCount: bookmarks.size, savedList }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarksContext);
}
