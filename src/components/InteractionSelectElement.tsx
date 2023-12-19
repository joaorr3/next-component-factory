import { cn } from "../styles/utils";

export type InteractionSelectElement = {
  text: string;
  active?: boolean;
  href?: string;
  className?: string;
  onPress?: () => void;
};

const selectBase = /*tw*/ `
  w-full
  cursor-pointer
  p-5
  font-semibold
  transition-colors
  select-none
  flex
  items-center
  dark:text-white
  dark:bg-neutral-800
  dark:hover:bg-neutral-700
  dark:active:bg-neutral-600

  text-black
  bg-neutral-100
  hover:bg-neutral-200
  active:bg-neutral-300
`;

const activeClasses = /*tw*/ `
dark:bg-neutral-600
bg-neutral-300
`;

type Classes = {
  baseClasses: string;
  props: {
    className?: string;
    active?: boolean;
  };
};

const classes = ({ baseClasses, props: { active, className } }: Classes) => {
  return cn(baseClasses, active ? activeClasses : "", className);
};

export const InteractionSelectElement = ({
  text,
  active,
  className,
  onPress,
}: Omit<InteractionSelectElement, "href">): JSX.Element => {
  const cls = classes({
    baseClasses: selectBase,
    props: { active, className },
  });

  return (
    <div className={cls} onClick={onPress}>
      {text}
    </div>
  );
};
