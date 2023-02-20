import { animated, useSpringValue } from "@react-spring/web";
import React from "react";

export type ExpandableProps = React.PropsWithChildren<{
  expand?: boolean;
}>;

export const Expandable = ({
  expand,
  children,
}: ExpandableProps): JSX.Element => {
  const additionalInfoRef = React.useRef<HTMLDivElement>(null);

  const Height = useSpringValue<number | "unset">(0, {
    config: {
      tension: 260,
      friction: 32,
      mass: 1,
    },
  });

  const getElementHeight = () => additionalInfoRef.current?.offsetHeight || 0;

  React.useEffect(() => {
    Height.start({
      to: expand ? getElementHeight() : 0,
      onRest: () => {
        if (expand) {
          Height.start({
            to: "unset",
          });
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expand]);

  return (
    <animated.div
      style={{
        overflowY: "hidden",
        height: Height,
      }}
    >
      <div ref={additionalInfoRef}>{children}</div>
    </animated.div>
  );
};
