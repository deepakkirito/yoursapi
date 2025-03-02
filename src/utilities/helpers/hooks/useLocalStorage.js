import { useEffect, useRef, useState } from "react";

export const useLocalStorage = (key, initialValue) => {
  const valueRef = useRef(null);

  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    const existing = window.localStorage.getItem(key);
    try {
      valueRef.current = existing;
      const res = valueRef.current
        ? JSON.parse(valueRef.current)
        : initialValue;
      return res;
    } catch (e) {
      // JSON.parse hit error, Then mostly its a plain string, In that case we just return value, what we get. once we use this hook all the places ref. line no:29
      valueRef.current = existing || initialValue || "";
      return existing || initialValue || "";
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (storedValue !== undefined) {
      // Ignore the stringify, if it is already a string is temparory, will change this, once this hook is used all the places.
      const newValue =
        typeof storedValue === "string"
          ? storedValue
          : JSON.stringify(storedValue);
      const oldValue = valueRef.current;
      valueRef.current = newValue;

      window.localStorage.setItem(key, newValue);
      window.dispatchEvent(
        new StorageEvent("storage", {
          storageArea: window.localStorage,
          url: window.location.href,
          key,
          newValue,
          oldValue,
        })
      );
    } else {
      window.localStorage.removeItem(key);
      window.dispatchEvent(
        new StorageEvent("storage", {
          storageArea: window.localStorage,
          url: window.location.href,
          key,
        })
      );
    }
  }, [storedValue, key]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key !== key || e.storageArea !== window.localStorage) return;

      try {
        if (e.newValue !== valueRef.current) {
          valueRef.current = e.newValue;
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : undefined);
        }
      } catch (e) {
        console.log(e);
      }
    };

    if (typeof window === "undefined") return;

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setStoredValue];
};
