import React from "react";
import { cn } from "../styles/utils";
import { InteractionElement } from "./InteractionElement";

export type Data = {
  label?: string;
  value?: string | number | null;
  element?: JSX.Element;
  visible?: boolean;
  active?: boolean;
};

export type DataDisplayProps = {
  actionButton?: {
    label: string;
    isActive?: boolean;
    onPress?: () => void;
  };
  header?: string | null;
  data?: Data[];
  nude?: boolean;
  className?: string;
};

export const DataDisplay = ({
  actionButton,
  header,
  data,
  nude,
  className,
}: DataDisplayProps): JSX.Element => {
  return (
    <div className={cn("relative", className)}>
      {actionButton && (
        <div className="absolute right-0 -top-16">
          <InteractionElement
            text={actionButton.label}
            active={actionButton.isActive}
            onPress={actionButton.onPress}
          />
        </div>
      )}

      <div
        className={cn(
          nude
            ? ""
            : "mb-4 flex flex-col rounded-xl bg-neutral-200 p-4 dark:bg-neutral-800"
        )}
      >
        {header && (
          <div className="mb-3 flex items-center">
            <p className="text-xl font-bold">{header}</p>
          </div>
        )}

        {!!data?.length && (
          <div className="flex flex-wrap gap-4">
            {data.map((d, key) => {
              return <Property key={key} {...d} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const Property = ({
  label,
  value,
  element,
  visible = true,
  active,
}: Data): JSX.Element => {
  if (!visible) {
    return <React.Fragment />;
  }
  if (element) {
  }
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "flex max-w-sm shrink-0 flex-col justify-center rounded-xl bg-neutral-300 p-5 dark:bg-neutral-900 dark:bg-opacity-40",
        active ? "m-1 ring-1 ring-neutral-400 dark:ring-neutral-600" : ""
      )}
    >
      {label && <p className="mb-1 text-sm font-bold">{label}</p>}

      <p className="max-w-xl cursor-text overflow-hidden overflow-ellipsis text-sm">
        {element ? element : value || "--"}
      </p>
    </div>
  );
};
