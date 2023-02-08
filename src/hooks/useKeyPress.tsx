import React from "react";

export const useKeyPress = ({
  targetKey,
  attach,
  cb,
}: {
  targetKey: string;
  cb: () => void;
  attach?: boolean;
}) => {
  const handleKeyPress = React.useCallback(
    ({ key }: KeyboardEvent) => {
      if (key === targetKey) {
        cb();
      }
    },
    [cb, targetKey]
  );

  React.useEffect(() => {
    if (attach) {
      document.addEventListener("keydown", handleKeyPress);
      return () => {
        document.removeEventListener("keydown", handleKeyPress);
      };
    } else {
      document.removeEventListener("keydown", handleKeyPress);
    }
  }, [handleKeyPress, attach]);
};
