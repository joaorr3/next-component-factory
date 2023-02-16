import { animated, type SpringValue } from "@react-spring/web";
import React from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { useKeyPress } from "../hooks/useKeyPress";
import { usePathMatch } from "../hooks/usePathMatch";
import { useRoles } from "../hooks/useRoles";
import { useSpringPopup } from "../hooks/useSpringPopup";
import { routes } from "../routes";
import { InteractionElement } from "./InteractionElement";

export const ManageMenu = (): JSX.Element => {
  const { matchPath } = usePathMatch();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const { value, isVisible, close } = useSpringPopup(isOpen, (s) =>
    setIsOpen(s)
  );

  useKeyPress({ targetKey: "Escape", cb: close, attach: isOpen });

  const { valid } = useRoles(routes.Manage.roles);

  if (!valid) {
    return <React.Fragment />;
  }

  return (
    <div className="relative">
      <InteractionElement
        className="mr-3"
        text="Manage"
        onPress={() => setIsOpen(true)}
        active={matchPath({
          path: routes.Manage.path,
          match: routes.Manage.match,
        })}
      />

      <PopUpMenu isOpen={isVisible} value={value} onPressOutside={close}>
        <InteractionElement
          className="mb-3"
          text={routes.ManageComponents.label}
          href={routes.ManageComponents.path}
          onPress={() => close()}
        />
        <InteractionElement
          className="mb-3"
          text={"FAQs"}
          href={routes.ManageFAQs.path}
          onPress={() => close()}
        />
        <InteractionElement
          className="mb-3"
          text={"LABS"}
          href={routes.ManageLabs.path}
          onPress={() => close()}
        />
        <InteractionElement
          className="mb-3"
          text={"Users"}
          href={routes.ManageUsers.path}
          onPress={() => close()}
        />
        <InteractionElement
          className="mb-3"
          text={"Media"}
          href={routes.ManageMedia.path}
          onPress={() => close()}
        />
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
          className="absolute right-3 top-14 flex flex-col items-end rounded-2xl border-2 border-solid border-neutral-400 bg-neutral-100 p-5 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {children}
        </animated.div>
      </React.Fragment>
    );
  }
  return <React.Fragment />;
};
