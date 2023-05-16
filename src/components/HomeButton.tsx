import Image from "next/image";
import Link from "next/link";
import { usePathMatch } from "../hooks/usePathMatch";
import { routes } from "../routes";
import { useTheme } from "../styles/ThemeProvider";
import { cn } from "../styles/utils";
import { useLoading } from "../utils/GlobalState/GlobalStateProvider";
import Loader from "./Loader";

const ring = /*tw*/ `border-2 rounded-full border-solid border-transparent`;
const ringActive = /*tw*/ `border-neutral-700`;

export const HomeButton = () => {
  const { matchPath } = usePathMatch();
  const { themeName } = useTheme();
  const { isLoading } = useLoading("setOnly");

  const logo = themeName === "dark" ? "/favicon.ico" : "/cf-logo-light-3.png";

  const isActive = matchPath({
    path: routes.Home.path,
    match: routes.Home.match,
  });

  return (
    <div
      className="relative ml-4 mr-2 h-10 w-10"
      style={{
        minHeight: 40,
        minWidth: 40,
      }}
    >
      <div
        className={cn(
          "z-10 transition-opacity duration-500",
          ring,
          isActive ? ringActive : "",
          isLoading ? "opacity-0" : ""
        )}
      >
        <Link href={routes.Home.path}>
          <Image height={38} width={38} alt="" src={logo} />
        </Link>
      </div>

      <Loader.Island
        zIndex={-1}
        overlayOpacity={0}
        className={!isLoading ? "opacity-0" : ""}
        isLoading={isLoading}
      />
    </div>
  );
};
