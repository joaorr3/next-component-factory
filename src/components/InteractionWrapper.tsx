import React from "react";
import { cn } from "../styles/utils";

export type InteractionElementProps = React.PropsWithChildren<{
  active?: boolean;
  className?: string;
  round?: boolean;
  onPress?: () => void;
}>;

const base = /*tw*/ `
  cursor-pointer
  rounded-full
  p-4
  m-1
  transition-colors
  font-bold
  select-none
  flex
  items-center
  justify-center
  h-12
  bg-opacity-0
bg-neutral-300  
dark:bg-neutral-700
  
  hover:bg-opacity-40
hover:bg-neutral-300  
  active:bg-opacity-80
  
  dark:bg-opacity-0
  dark:hover:bg-opacity-30
dark:hover:bg-neutral-700
  dark:active:bg-opacity-80
`;

export const InteractionWrapper = ({
  active,
  className,
  round,
  onPress,
  children,
}: InteractionElementProps): JSX.Element => {
  const cls = cn(
    base,
    active ? "bg-opacity-30 dark:bg-opacity-30" : "",
    round ? "h-12 w-12 p-0" : "",
    className
  );

  return (
    <div className={cls} onClick={onPress}>
      {children}
    </div>
  );
};
