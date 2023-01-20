import Link from "next/link";
import React from "react";

export type BackButtonProps = {
  href: string;
};

export const BackButton = ({ href }: BackButtonProps): JSX.Element => {
  return (
    <Link href={href} className="max-w-max">
      <div className="mb-3 max-w-max cursor-pointer rounded-2xl bg-neutral-600 bg-opacity-40 p-3 font-bold hover:bg-opacity-50">
        back
      </div>
    </Link>
  );
};
