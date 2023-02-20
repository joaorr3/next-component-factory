import React from "react";
import { cn } from "../styles/utils";

export type ArrowProps = {
  direction?: "up" | "down" | "left" | "right";
  disabled?: boolean;
  className?: string;
};

const rotation = (direction: ArrowProps["direction"]) => {
  switch (direction) {
    case "up":
      return /*tw*/ `rotate-180`;
    case "left":
      return /*tw*/ `rotate-90`;
    case "right":
      return /*tw*/ `-rotate-90`;
    case "down":
    default:
      return "";
  }
};

export const Arrow = ({
  direction = "down",
  disabled,
  className,
}: ArrowProps): JSX.Element => {
  return (
    <div
      className={cn(
        "relative h-8 w-8 transition-transform",
        className,
        rotation(direction)
      )}
    >
      <svg
        className={cn(disabled ? "fill-neutral-600" : "fill-neutral-400")}
        viewBox="0 0 48 48"
        height="32"
        width="32"
      >
        <path d="m24 30.75-12-12 2.15-2.15L24 26.5l9.85-9.85L36 18.8Z" />
      </svg>
    </div>
  );
};
