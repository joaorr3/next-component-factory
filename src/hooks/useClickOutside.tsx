import React from "react";

export function useClickOutside({
  ref,
  callback,
  attach = true,
}: {
  ref: React.RefObject<HTMLDivElement>;
  callback?: () => void;
  attach?: boolean;
}): void {
  const handleClick = (event: MouseEvent) => {
    if (event.target instanceof Element) {
      if (ref.current && !ref.current.contains?.(event.target)) {
        callback?.();
      }
    }
  };

  React.useEffect(() => {
    if (attach) {
      document.addEventListener("click", handleClick);
      return () => {
        document.removeEventListener("click", handleClick);
      };
    } else {
      document.removeEventListener("click", handleClick);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attach]);
}
