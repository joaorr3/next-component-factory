import Link from "next/link";
import React from "react";
import { InteractionWrapper } from "./InteractionWrapper";

export type InteractionElementProps = {
  text: string;
  active?: boolean;
  href?: string;
  className?: string;
  onPress?: () => void;
};

export type WithLinkProps = {
  link?: boolean;
};

export const WithLink = ({
  href,
  children,
}: React.PropsWithChildren<
  Pick<InteractionElementProps, "href">
>): JSX.Element => {
  if (href) {
    return <Link href={href}>{children}</Link>;
  }
  return <React.Fragment>{children}</React.Fragment>;
};

export const InteractionElement = ({
  text,
  active,
  href,
  className,
  onPress,
}: InteractionElementProps): JSX.Element => {
  return (
    <WithLink href={href}>
      <InteractionWrapper
        active={active}
        className={className}
        onPress={onPress}
      >
        <p>{text}</p>
      </InteractionWrapper>
    </WithLink>
  );
};
