import { useState, useEffect } from "react";
import { TrainSearchResult } from "@railpulse/types";

export interface RecentSearchItem {
  trainNumber: string;
  trainName: string;
  sourceStation: string;
  destinationStation: string;
  lastViewed: string; // ISO string
}

export interface FavouriteTrainItem {
  trainNumber: string;
  trainName: string;
  sourceStation: string;
  destinationStation: string;
  addedAt: string;
}

const RECENT_SEARCHES_KEY = "railpulse_recent_searches_v1";
const FAVOURITES_KEY = "railpulse_favourites_v1";

export function getRecentSearches(): RecentSearchItem[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(item: Omit<RecentSearchItem, "lastViewed">) {
  try {
    const current = getRecentSearches().filter((s) => s.trainNumber !== item.trainNumber);
    const updated: RecentSearchItem[] = [
      {
        ...item,
        lastViewed: new Date().toISOString(),
      },
      ...current,
    ].slice(0, 10); // Limit to 10 per PRD §3.5

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("railpulse_recent_updated"));
  } catch (err) {
    console.error("Failed to save recent search", err);
  }
}

export function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
  window.dispatchEvent(new Event("railpulse_recent_updated"));
}

export function getFavourites(): FavouriteTrainItem[] {
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavourite(item: Omit<FavouriteTrainItem, "addedAt">): boolean {
  try {
    const current = getFavourites();
    const exists = current.some((f) => f.trainNumber === item.trainNumber);
    let updated: FavouriteTrainItem[];

    if (exists) {
      updated = current.filter((f) => f.trainNumber !== item.trainNumber);
    } else {
      updated = [
        ...current,
        {
          ...item,
          addedAt: new Date().toISOString(),
        },
      ];
    }

    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("railpulse_favs_updated"));
    return !exists;
  } catch {
    return false;
  }
}

export function isFavourite(trainNumber: string): boolean {
  return getFavourites().some((f) => f.trainNumber === trainNumber);
}

// React hooks for reactive state
export function useRecentSearches() {
  const [recents, setRecents] = useState<RecentSearchItem[]>(getRecentSearches);

  useEffect(() => {
    const handler = () => setRecents(getRecentSearches());
    window.addEventListener("railpulse_recent_updated", handler);
    return () => window.removeEventListener("railpulse_recent_updated", handler);
  }, []);

  return { recents, clear: clearRecentSearches, add: saveRecentSearch };
}

export function useFavourites() {
  const [favourites, setFavourites] = useState<FavouriteTrainItem[]>(getFavourites);

  useEffect(() => {
    const handler = () => setFavourites(getFavourites());
    window.addEventListener("railpulse_favs_updated", handler);
    return () => window.removeEventListener("railpulse_favs_updated", handler);
  }, []);

  return {
    favourites,
    toggle: toggleFavourite,
    isFav: (num: string) => favourites.some((f) => f.trainNumber === num),
  };
}
