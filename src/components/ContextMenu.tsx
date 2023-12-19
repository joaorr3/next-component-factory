import { animated, type SpringValue } from "@react-spring/web";
import React from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { useKeyPress } from "../hooks/useKeyPress";
import { useSpringPopup } from "../hooks/useSpringPopup";
import { cn } from "../styles/utils";
import { InteractionElement } from "./InteractionElement";

type MenuItem = {
  label: string;
  action?: () => void;
  closeOnly?: boolean;
  isActive?: boolean;
};

type ContextMenuProps = {
  triggerLabel: string;
  menuItems: MenuItem[];
  closeOnInteraction?: boolean;
  menuDirectionRow?: boolean;
};

export const ContextMenu = ({
  triggerLabel,
  menuDirectionRow,
  menuItems,
  closeOnInteraction = true,
}: ContextMenuProps): JSX.Element => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const { value, isVisible, close } = useSpringPopup(isOpen, (s) =>
    setIsOpen(s)
  );

  useKeyPress({ targetKey: "Escape", cb: close, attach: isOpen });

  const handleOnItemPress = React.useCallback(
    (item: MenuItem) => {
      if (closeOnInteraction) {
        close();
      }
      if (!item.closeOnly) {
        item.action?.();
      }
    },
    [close, closeOnInteraction]
  );

  return (
    <div className="relative">
      <InteractionElement
        text={triggerLabel}
        onPress={() => setIsOpen(true)}
        active={isOpen}
      />

      <PopUpMenu isOpen={isVisible} value={value} onPressOutside={close}>
        <div
          className={cn(
            "flex items-center",
            menuDirectionRow ? "flex-row" : "flex-col"
          )}
        >
          {menuItems.map((item, key) => {
            return (
              <InteractionElement
                key={key}
                className={cn(menuDirectionRow ? "m-1" : "mb-3")}
                text={item.label}
                active={item.isActive}
                onPress={() => handleOnItemPress(item)}
              />
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
            translateY: value.to([0, 1], [-20, 0], "clamp"),
          }}
          className="absolute right-0 top-14 flex flex-col items-end rounded-2xl border-2 border-solid border-neutral-400 bg-neutral-100 p-5 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {children}
        </animated.div>
      </React.Fragment>
    );
  }
  return <React.Fragment />;
};
