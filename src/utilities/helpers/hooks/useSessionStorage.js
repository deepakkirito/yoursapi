import { useEffect, useState } from "react";

export const useSessionStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    const item = window.sessionStorage.getItem(key);
    if (item) {
      setStoredValue(JSON.parse(item));
    }
  }, [key]);

  const setValue = (value) => {
    setStoredValue(value);
    window.sessionStorage.setItem(key, JSON.stringify(value));
  };
  return [storedValue, setValue];
};
