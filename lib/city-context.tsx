import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "topranker_selected_city";
const DEFAULT_CITY = "Dallas";

export const SUPPORTED_CITIES = ["Dallas", "Austin", "Houston", "San Antonio", "Fort Worth"] as const;
export type SupportedCity = (typeof SUPPORTED_CITIES)[number];

interface CityContextValue {
  city: SupportedCity;
  setCity: (city: SupportedCity) => void;
  isLoaded: boolean;
}

const CityContext = createContext<CityContextValue>({
  city: DEFAULT_CITY,
  setCity: () => {},
  isLoaded: false,
});

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<SupportedCity>(DEFAULT_CITY);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && SUPPORTED_CITIES.includes(stored as SupportedCity)) {
        setCityState(stored as SupportedCity);
      }
      setIsLoaded(true);
    });
  }, []);

  const setCity = useCallback((newCity: SupportedCity) => {
    setCityState(newCity);
    AsyncStorage.setItem(STORAGE_KEY, newCity);
  }, []);

  return (
    <CityContext.Provider value={{ city, setCity, isLoaded }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}
