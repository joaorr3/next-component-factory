import React from "react";

export const useKeyPress = (targetKey: string, cb: () => void) => {
  const handleKeyPress = React.useCallback(
    ({ key }: KeyboardEvent) => {
      if (key === targetKey) {
        cb();
      }
    },
    [cb, targetKey]
  );

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);
};
