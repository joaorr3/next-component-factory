import { animated, type SpringValue } from "@react-spring/web";
import React from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useKeyPress } from "../../hooks/useKeyPress";
import { useSpringPopup } from "../../hooks/useSpringPopup";
import { InteractionSelectElement } from "../InteractionSelectElement";

type SelectMenuProps = {
  selectedValue?: string;
  menuItems: string[];
  onSelect?: (value: string, index: number) => void;
  children: (props: {
    isOpen: boolean;
    setIsOpen: (status: boolean) => void;
  }) => React.ReactNode;
};

export const SelectMenu = ({
  selectedValue,
  menuItems,
  onSelect,
  children,
}: SelectMenuProps): JSX.Element => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const { value, isVisible, close } = useSpringPopup(isOpen, (s) =>
    setIsOpen(s)
  );

  useKeyPress({ targetKey: "Escape", cb: close, attach: isOpen });

  const handleOnItemPress = React.useCallback(
    (item: string, index: number) => {
      close();
      onSelect?.(item, index);
    },
    [close, onSelect]
  );

  return (
    <div className="relative">
      {children({ isOpen, setIsOpen })}

      <PopUpMenu isOpen={isVisible} value={value} onPressOutside={close}>
        <div className="flex w-full flex-1 flex-col items-center">
          {menuItems.map((item, key) => {
            return (
              <React.Fragment key={key}>
                <InteractionSelectElement
                  className="w-full"
                  text={item}
                  active={item === selectedValue}
                  onPress={() => handleOnItemPress(item, key)}
                />
                {key < menuItems.length - 1 && (
                  <div
                    className="mx-1 w-full bg-neutral-700"
                    style={{ height: 1 }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </PopUpMenu>
    </div>
  );
};

export type PopUpMenuProps = React.PropsWithChildren<{
  isOpen?: boolean;
  value: SpringValue<number>;
  onPressOutside?: () => void;
}>;

export const PopUpMenu = ({
  isOpen,
  value,
  onPressOutside,
  children,
}: PopUpMenuProps): JSX.Element => {
  const ref = React.useRef<HTMLDivElement>(null);

  useClickOutside({ ref, attach: isOpen, callback: onPressOutside });

  if (isOpen) {
    return (
      <React.Fragment>
        <animated.div
          ref={ref}
          style={{
            opacity: value,
            zIndex: 120,
            scale: value.to([0, 1], [0.9, 1], "clamp"),
            translateY: value.to([0, 1], [-12, 0], "clamp"),
          }}
          className="absolute right-0 mt-1 flex w-full flex-col items-start overflow-hidden rounded-2xl p-0 outline outline-neutral-400 dark:outline-neutral-600"
        >
          {children}
        </animated.div>
      </React.Fragment>
    );
  }
  return <React.Fragment />;
};
