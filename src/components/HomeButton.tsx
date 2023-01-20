import Image from "next/image";
import Link from "next/link";
import React from "react";
import { routes } from "../routes";

export const HomeButton = () => {
  return (
    <div className="ml-4 mr-2">
      <Link href={routes.Home.path}>
        <Image height={32} width={32} alt="" src={"/favicon.ico"} />
      </Link>
    </div>
  );
};
