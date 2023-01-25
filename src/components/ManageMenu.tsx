import { animated, type SpringValue } from "@react-spring/web";
import React from "react";
import { usePathMatch } from "../hooks/usePathMatch";
import { useRoles } from "../hooks/useRoles";
import { useSpringPopup } from "../hooks/useSpringPopup";
import { routes } from "../routes";
import { cn } from "../styles/utils";
import { InteractionElement } from "./InteractionElement";

export const ManageMenu = (): JSX.Element => {
  const { matchPath } = usePathMatch();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const { value, isVisible, close } = useSpringPopup(isOpen, (s) =>
    setIsOpen(s)
  );

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
          href={routes.FAQs.path}
          onPress={() => close()}
        />
        <InteractionElement
          className="mb-3"
          text={"LABS"}
          href={""}
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

const base = /*tw*/ `
  flex
  flex-col
  rounded-2xl
  absolute
  right-0
  top-14
  p-5
  items-end
`;

export const PopUpMenu = ({
  isOpen,
  value,
  onPressOutside,
  children,
}: PopUpMenuProps): JSX.Element => {
  if (isOpen) {
    return (
      <React.Fragment>
        <animated.div
          style={{
            opacity: value,
            zIndex: 120,
            scale: value.to([0, 1], [0.9, 1], "clamp"),
            translateY: value.to([0, 1], [-20, 0], "clamp"),
            backgroundColor: "rgb(28, 28, 28)",
          }}
          className={cn(base)}
        >
          {children}
        </animated.div>

        <animated.div
          className="fixed inset-0 flex h-screen items-center justify-center"
          style={{
            zIndex: 110,
            // backgroundColor: "rgba(24, 24, 24, 0.3)",
            opacity: value,
          }}
          onClick={onPressOutside}
        />
      </React.Fragment>
    );
  }
  return <React.Fragment />;
};
