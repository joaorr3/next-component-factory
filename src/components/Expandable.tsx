import { animated, useSpringValue } from "@react-spring/web";
import React from "react";

export type ExpandableProps = React.PropsWithChildren<{
  expand?: boolean;
}>;

const getElementHeight = (element: HTMLDivElement | null) => {
  return new Promise<number>((res, rej) => {
    const height =
      element?.offsetHeight || element?.getBoundingClientRect().height || 0;
    if (height) {
      res(height);
    } else {
      rej("Element height is not valid");
    }
  });
};

export const Expandable = ({
  expand = false,
  children,
}: ExpandableProps): JSX.Element => {
  const elementRef = React.useRef<HTMLDivElement>(null);

  const Height = useSpringValue<number | "unset">(0, {
    config: {
      tension: 260,
      friction: 32,
      mass: 1,
    },
  });

  const animate = (to: number) => {
    Height.start({
      to,
    }).then(() => {
      if (to > 0 && Height.get() === to) {
        Height.start({
          to: "unset",
          immediate: true,
        });
      }
    });
  };

  React.useEffect(() => {
    if (expand) {
      getElementHeight(elementRef.current).then((h) => {
        animate(h);
      });
    } else {
      animate(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expand]);

  return (
    <animated.div
      style={{
        overflowY: "hidden",
        height: Height,
      }}
    >
      <div ref={elementRef}>{children}</div>
    </animated.div>
  );
};
