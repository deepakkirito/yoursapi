import { useEffect, useRef, useState, useCallback } from "react";

export const useLocalStorage = (key, initialValue) => {
  const valueRef = useRef(null);

  // Initialize state with value from localStorage
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const existing = window.localStorage.getItem(key);
      valueRef.current = existing;
      return existing ? JSON.parse(existing) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Update localStorage when storedValue changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (storedValue !== undefined) {
        const newValue =
          typeof storedValue === "string"
            ? storedValue
            : JSON.stringify(storedValue);
        const oldValue = valueRef.current;

        valueRef.current = newValue;
        window.localStorage.setItem(key, newValue);

        // Trigger a storage event for other tabs
        window.dispatchEvent(
          new StorageEvent("storage", {
            key,
            oldValue,
            newValue,
            storageArea: window.localStorage,
          })
        );
      } else {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error("Error updating localStorage:", error);
    }
  }, [storedValue, key]);

  // Sync state with storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key !== key || e.storageArea !== window.localStorage) return;

      try {
        if (e.newValue !== valueRef.current) {
          valueRef.current = e.newValue;
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : undefined);
        }
      } catch (error) {
        console.error("Error parsing localStorage change:", error);
      }
    };

    if (typeof window === "undefined") return;

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  // Memoized setter function to avoid unnecessary re-renders
  const updateValue = useCallback((newValue) => {
    setStoredValue((prevValue) =>
      typeof newValue === "function" ? newValue(prevValue) : newValue
    );
  }, []);

  return [storedValue, updateValue];
};
