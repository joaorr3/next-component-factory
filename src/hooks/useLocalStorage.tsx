import React from "react";

function getItem<T>(key: string) {
  if (typeof window === "undefined") {
    return {
      parsed: undefined,
      raw: undefined,
    };
  }

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as T;

      return {
        parsed,
        raw,
      };
    }
    return {
      parsed: undefined,
      raw,
    };
  } catch (error) {
    console.log("getItem:error: ", error);
  }
  return {
    parsed: undefined,
    raw: undefined,
  };
}

function setItem<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log("setItem:error: ", error);
  }
}

export const localStorageActions = {
  get: getItem,
  set: setItem,
};

export function useLocalStorage<T>(key: string, fallbackValue: T) {
  const [hydrated, setHydrated] = React.useState(false);
  const [value, setValue] = React.useState<T>(fallbackValue);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hydrated) {
      const { parsed } = getItem<T>(key);
      const next = parsed ? parsed : fallbackValue;
      setValue(next);
    }
  }, [hydrated, fallbackValue, key]);

  React.useEffect(() => {
    if (hydrated) {
      setItem<T>(key, value);
    }
  }, [hydrated, key, value]);

  return [value, setValue] as const;
}
