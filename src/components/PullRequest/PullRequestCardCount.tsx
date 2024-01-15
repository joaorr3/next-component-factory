import React from "react";
import { cn } from "../../styles/utils";

export const PullRequestCardInfo: React.FC<{
  className?: string;
  label: string
  description?: string
  info: string | number
}> = ({ className, description, label = '', info = '' }) => {
  return (
    <div
    className={cn(
      "mb-4 flex  flex-col rounded-xl bg-neutral-200 p-4 transition-transform  dark:bg-neutral-800",
      className
    )}
  >

    <p className="text-2xl font-bold mb-5">
      {info}
    </p>
    <p className=" text-xl font-semibold text-neutral-600 capitalize">{label.toLowerCase()}</p>
    {description && (<p className=" text-sm font-semibold text-neutral-600 capitalize">{description}</p>)}

  </div>
  );
};
