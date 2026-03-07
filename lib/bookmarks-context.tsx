import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./auth-context";

const STORAGE_KEY = "topranker_bookmarks";

interface BookmarksContextValue {
  bookmarks: Set<string>;
  isBookmarked: (businessId: string) => boolean;
  toggleBookmark: (businessId: string) => void;
  bookmarkCount: number;
}

const BookmarksContext = createContext<BookmarksContextValue>({
  bookmarks: new Set(),
  isBookmarked: () => false,
  toggleBookmark: () => {},
  bookmarkCount: 0,
});

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const storageKey = user ? `${STORAGE_KEY}_${user.id}` : STORAGE_KEY;

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((stored) => {
      if (stored) {
        try {
          setBookmarks(new Set(JSON.parse(stored)));
        } catch {}
      }
    });
  }, [storageKey]);

  const persist = useCallback((next: Set<string>) => {
    AsyncStorage.setItem(storageKey, JSON.stringify([...next]));
  }, [storageKey]);

  const isBookmarked = useCallback((businessId: string) => {
    return bookmarks.has(businessId);
  }, [bookmarks]);

  const toggleBookmark = useCallback((businessId: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(businessId)) {
        next.delete(businessId);
      } else {
        next.add(businessId);
      }
      persist(next);
      return next;
    });
  }, [persist]);

  return (
    <BookmarksContext.Provider value={{ bookmarks, isBookmarked, toggleBookmark, bookmarkCount: bookmarks.size }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarksContext);
}
