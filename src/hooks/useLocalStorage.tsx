import React from "react";

export function useLocalStorage<T>(key: string, fallbackValue: T) {
  const [hydrated, setHydrated] = React.useState(false);
  const [value, setValue] = React.useState<T>(fallbackValue);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hydrated) {
      const stored = localStorage.getItem(key);
      const next = stored ? JSON.parse(stored) : fallbackValue;
      setValue(next);
    }
  }, [hydrated, fallbackValue, key]);

  React.useEffect(() => {
    if (hydrated) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [hydrated, key, value]);

  return [value, setValue] as const;
}
