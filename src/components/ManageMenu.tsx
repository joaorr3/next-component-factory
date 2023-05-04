import { animated, type SpringValue } from "@react-spring/web";
import Link from "next/link";
import React from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { useKeyPress } from "../hooks/useKeyPress";
import { usePathMatch } from "../hooks/usePathMatch";
import { useRoles } from "../hooks/useRoles";
import { useSpringPopup } from "../hooks/useSpringPopup";
import { routes } from "../routes";
import { InteractionWrapper } from "./InteractionWrapper";

export const SettingsIcon = (): JSX.Element => {
  return (
    <svg
      className="fill-black dark:fill-neutral-300"
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      width="24"
      viewBox="0 96 960 960"
    >
      <path d="m388 976-20-126q-19-7-40-19t-37-25l-118 54-93-164 108-79q-2-9-2.5-20.5T185 576q0-9 .5-20.5T188 535L80 456l93-164 118 54q16-13 37-25t40-18l20-127h184l20 126q19 7 40.5 18.5T669 346l118-54 93 164-108 77q2 10 2.5 21.5t.5 21.5q0 10-.5 21t-2.5 21l108 78-93 164-118-54q-16 13-36.5 25.5T592 850l-20 126H388Zm92-270q54 0 92-38t38-92q0-54-38-92t-92-38q-54 0-92 38t-38 92q0 54 38 92t92 38Zm0-60q-29 0-49.5-20.5T410 576q0-29 20.5-49.5T480 506q29 0 49.5 20.5T550 576q0 29-20.5 49.5T480 646Zm0-70Zm-44 340h88l14-112q33-8 62.5-25t53.5-41l106 46 40-72-94-69q4-17 6.5-33.5T715 576q0-17-2-33.5t-7-33.5l94-69-40-72-106 46q-23-26-52-43.5T538 348l-14-112h-88l-14 112q-34 7-63.5 24T306 414l-106-46-40 72 94 69q-4 17-6.5 33.5T245 576q0 17 2.5 33.5T254 643l-94 69 40 72 106-46q24 24 53.5 41t62.5 25l14 112Z" />
    </svg>
  );
};

const menuItem = /*tw*/ `
  w-full 
  rounded-none
  h-12
  flex
  items-center
  justify-center
  font-bold
  select-none
  transition-colors
  duration-75

  hover:bg-opacity-40
hover:bg-neutral-300  
  active:bg-opacity-80
    
  dark:bg-opacity-0
  dark:hover:bg-opacity-30
dark:hover:bg-neutral-700
  dark:active:bg-opacity-80
  
`;

export type MenuItemProps = {
  text: string;
  href: string;
  onPress: () => void;
};

export const MenuItem = ({
  text,
  href,
  onPress,
}: MenuItemProps): JSX.Element => {
  return (
    <Link href={href} className={menuItem} onClick={onPress}>
      {text}
    </Link>
  );
};

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
      <InteractionWrapper
        round
        onPress={() => setIsOpen(true)}
        active={matchPath({
          path: routes.Manage.path,
          match: routes.Manage.match,
        })}
      >
        <SettingsIcon />
      </InteractionWrapper>

      <PopUpMenu isOpen={isVisible} value={value} onPressOutside={close}>
        <MenuItem
          text={routes.ManageComponents.label}
          href={routes.ManageComponents.path}
          onPress={() => close()}
        />
        <MenuItem
          text={routes.ManageFAQs.label}
          href={routes.ManageFAQs.path}
          onPress={() => close()}
        />
        <MenuItem
          text={routes.ManageLabs.label}
          href={routes.ManageLabs.path}
          onPress={() => close()}
        />
        <MenuItem
          text={routes.ManageUsers.label}
          href={routes.ManageUsers.path}
          onPress={() => close()}
        />
        <MenuItem
          text={routes.ManageRoles.label}
          href={routes.ManageRoles.path}
          onPress={() => close()}
        />
        <MenuItem
          text={routes.ManageMedia.label}
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
          className="absolute top-14 right-0 flex w-40 flex-col items-end overflow-hidden rounded-2xl border-2 border-solid border-neutral-400 bg-neutral-100 p-0 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {children}
        </animated.div>
      </React.Fragment>
    );
  }
  return <React.Fragment />;
};
