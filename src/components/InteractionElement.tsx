import Link from "next/link";
import React from "react";
import { useTheme } from "../styles/ThemeProvider";
import { cn } from "../styles/utils";
import { type ThemeNames } from "../theme";

export type InteractionElementProps = {
  text: string;
  active?: boolean;
  href?: string;
  className?: string;
  onPress?: () => void;
};

const base = /*tw*/ `
  max-w-max
  cursor-pointer
  rounded-2xl
  p-3
  font-bold
  transition-colors
  select-none
  flex
  items-center
`;

const baseDark = /*tw*/ `
text-white
bg-neutral-800
hover:bg-neutral-700
  active:bg-opacity-80
`;

const baseLight = /*tw*/ `
text-black
bg-neutral-200
hover:bg-neutral-300
  active:bg-opacity-80
`;

const activeDark = /*tw*/ `
  outline
outline-neutral-500
`;

const activeLight = /*tw*/ `
  outline
outline-neutral-400
`;

type Classes = {
  themeName: ThemeNames;
  props: {
    className?: string;
    active?: boolean;
  };
};

const classes = ({ themeName, props: { active, className } }: Classes) => {
  const activeClass = themeName === "dark" ? activeDark : activeLight;
  return cn(
    base,
    themeName === "dark" ? baseDark : baseLight,
    active ? activeClass : "",
    className
  );
};

export const InteractionElement = ({
  text,
  active,
  href,
  className,
  onPress,
}: InteractionElementProps): JSX.Element => {
  const { themeName } = useTheme();
  const cls = classes({ themeName, props: { active, className } });

  if (href) {
    return (
      <Link href={href}>
        <div className={cls} onClick={onPress}>
          {text}
        </div>
      </Link>
    );
  }
  return (
    <div className={cls} onClick={onPress}>
      {text}
    </div>
  );
};
