import { useTheme } from "../styles/ThemeProvider";
import { cn } from "../styles/utils";
import { type ThemeNames } from "../theme";

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
bg-neutral-600
`;

const activeLight = /*tw*/ `
bg-neutral-300
`;

type Classes = {
  themeName: ThemeNames;
  baseClasses: string;
  props: {
    className?: string;
    active?: boolean;
  };
};

const classes = ({
  themeName,
  baseClasses,
  props: { active, className },
}: Classes) => {
  const activeClass = themeName === "dark" ? activeDark : activeLight;
  return cn(
    baseClasses,
    themeName === "dark" ? baseDark : baseLight,
    active ? activeClass : "",
    className
  );
};

export const InteractionSelectElement = ({
  text,
  active,
  className,
  onPress,
}: Omit<InteractionSelectElement, "href">): JSX.Element => {
  const { themeName } = useTheme();
  const cls = classes({
    themeName,
    baseClasses: selectBase,
    props: { active, className },
  });

  return (
    <div className={cls} onClick={onPress}>
      {text}
    </div>
  );
};
