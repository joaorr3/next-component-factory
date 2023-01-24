import { useSpringValue } from "@react-spring/web";
import React from "react";

export const useSpringPopup = (
  isOpen?: boolean,
  onChange?: (status: boolean) => void
) => {
  const [isVisible, setIsVisible] = React.useState<boolean>(false);

  const value = useSpringValue(0, {
    config: {
      tension: 300,
      friction: 32,
      mass: 1,
    },
  });

  React.useEffect(() => {
    value.start(isOpen ? 1 : 0, {
      onStart: () => {
        if (isOpen) {
          setIsVisible(true);
        }
      },
      onRest: () => {
        if (!isOpen) {
          setIsVisible(false);
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const close = () => {
    value.start(0, {
      onStart: () => {
        // setLocked(false);
      },
      onRest: () => {
        setIsVisible(false);
        onChange?.(false);
      },
    });
  };

  return {
    value,
    isVisible,
    close,
  };
};
