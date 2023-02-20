import React from "react";
import { Arrow } from "./Arrow";
import { Expandable } from "./Expandable";

export type AccordionProps = React.PropsWithChildren<{
  headerLabel?: string;
  HeaderLabelElement?: () => JSX.Element;
  className?: string;
}>;

export const Accordion = ({
  headerLabel,
  HeaderLabelElement,
  className,
  children,
}: AccordionProps): JSX.Element => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  const header = React.useMemo(() => {
    if (HeaderLabelElement) {
      return <HeaderLabelElement />;
    }
    return <p className="text-2xl font-bold">{headerLabel}</p>;
  }, [HeaderLabelElement, headerLabel]);

  return (
    <div className={className}>
      <div
        className="flex cursor-pointer items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">{header}</div>

        <Arrow direction={isExpanded ? "up" : "down"} />
      </div>

      <Expandable expand={isExpanded}>{children}</Expandable>
    </div>
  );
};
