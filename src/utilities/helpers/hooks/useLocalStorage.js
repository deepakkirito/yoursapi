import { useEffect, useState } from "react";

export const useLocalStorage = (key, initialValue) => {
  // State to store the value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue; // Prevent issues in SSR

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Effect to update localStorage whenever storedValue changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (storedValue === undefined || storedValue === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }

      // Dispatch a storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent("storage", { key }));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Sync changes across tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (event) => {
      if (event.key === key) {
        try {
          setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
        } catch (error) {
          console.warn(`Error parsing localStorage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setStoredValue];
};
