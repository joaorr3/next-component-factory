import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathMatch } from "../hooks/usePathMatch";
import { routes } from "../routes";
import { useTheme } from "../styles/ThemeProvider";
import { cn } from "../styles/utils";

const ring = /*tw*/ `border-2 rounded-full border-solid border-transparent`;
const ringActive = /*tw*/ `border-neutral-700`;

export const HomeButton = () => {
  const { matchPath } = usePathMatch();
  const { themeName } = useTheme();

  const logo = themeName === "dark" ? "/favicon.ico" : "/cf-logo-light-3.png";

  const isActive = matchPath({
    path: routes.Home.path,
    match: routes.Home.match,
  });

  return (
    <div className="ml-4 mr-2">
      <div className={cn(ring, isActive ? ringActive : "")}>
        <Link href={routes.Home.path}>
          <Image height={38} width={38} alt="" src={logo} />
        </Link>
      </div>
    </div>
  );
};
