import React from "react";
import { cn } from "../styles/utils";
import { InteractionElement } from "./InteractionElement";

export type Data = {
  label?: string;
  value?: string | number | null;
  element?: JSX.Element;
  visible?: boolean;
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
        <div className="absolute right-0 -top-12">
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
            : "mb-4 flex flex-col rounded-xl bg-neutral-700 bg-opacity-25 p-4"
        )}
      >
        {header && (
          <div className="mb-6 flex items-center">
            <p className="text-xl font-bold">{header}</p>
          </div>
        )}

        {!!data?.length && (
          <div className="flex flex-wrap">
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
}: Data): JSX.Element => {
  if (!visible) {
    return <React.Fragment />;
  }
  if (element) {
  }
  return (
    <div className="mb-3 mr-4 flex max-w-sm shrink-0 flex-col justify-center rounded-xl bg-neutral-900 bg-opacity-30 p-5">
      <p className="mb-1 text-sm font-bold">{label}</p>

      <p className="max-w-xl overflow-hidden overflow-ellipsis text-sm">
        {element ? element : value || "--"}
      </p>
    </div>
  );
};