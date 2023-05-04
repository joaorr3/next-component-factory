import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathMatch } from "../hooks/usePathMatch";
import { routes } from "../routes";
import { cn } from "../styles/utils";
import { useGlobalState } from "../utils/GlobalState/GlobalStateProvider";
import { InteractionWrapper } from "./InteractionWrapper";

const base = /*tw*/ `
  transition-opacity
  flex
  flex-row
  items-center
`;

export const UserAvatar = (): JSX.Element => {
  const {
    state: {
      user: { profile },
    },
  } = useGlobalState();

  const { matchPath } = usePathMatch();

  if (!profile) {
    return <React.Fragment />;
  }

  const containerCls = cn(base);

  return (
    <Link href={routes.User.path}>
      <InteractionWrapper
        active={matchPath({
          path: routes.User.path,
          match: routes.User.match,
        })}
      >
        <div className={containerCls}>
          <p className="mr-2 font-bold">{profile.friendlyName}</p>

          {profile.avatarURL && (
            <div style={{ borderRadius: 80, overflow: "hidden" }}>
              <Image
                src={profile.avatarURL}
                width={24}
                height={24}
                alt="user image"
              />
            </div>
          )}
        </div>
      </InteractionWrapper>
    </Link>
  );
};
