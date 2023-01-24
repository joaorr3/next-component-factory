import { useEffect, useState } from "react";
import useIsomorphicLayoutEffect from "./useIsomorphicLayoutEffect";

type UseLockedBodyOutput = [boolean, (locked: boolean) => void];

function useLockedBody(initialLocked = false): UseLockedBodyOutput {
  const [locked, setLocked] = useState(initialLocked);

  useIsomorphicLayoutEffect(() => {
    if (!locked) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    const scrollBarWidth = 8;

    document.body.style.paddingRight = `${scrollBarWidth}px`;

    return () => {
      document.body.style.overflow = originalOverflow;

      if (scrollBarWidth) {
        document.body.style.paddingRight = originalPaddingRight;
      }
    };
  }, [locked]);

  useEffect(() => {
    if (locked !== initialLocked) {
      setLocked(initialLocked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLocked]);

  return [locked, setLocked];
}

export default useLockedBody;
