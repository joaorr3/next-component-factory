import type { LinkProps } from "next/link";
import Link from "next/link";
import React from "react";
import styled, { css } from "styled-components";
import { usePathMatch } from "../hooks/usePathMatch";
import { navBarRouteEntries } from "../routes";
import type { HandleRolesModel } from "../utils/roles";

const NavBar = ({
  hide,
  children,
}: React.PropsWithChildren<{ hide?: boolean }>) => {
  if (hide) {
    return <React.Fragment />;
  }

  return (
    <React.Fragment>
      <div className="fixed z-[100] flex h-20 w-full items-center justify-end backdrop-blur-md">
        {children}
      </div>
      <div style={{ height: 80 }} />
    </React.Fragment>
  );
};

export const NavBarContent = (): JSX.Element => {
  const { matchPath } = usePathMatch();

  return (
    <div className="flex h-full flex-1 items-center px-4 pl-0">
      {navBarRouteEntries.map(({ label, path, match, roles }) => {
        const active = matchPath({ path, match });

        return (
          <NavBarItem
            key={path}
            label={label}
            href={path}
            roles={roles}
            active={active}
          />
        );
      })}
    </div>
  );
};

export type NavBarItemProps = Pick<LinkProps, "href"> & {
  label: string;
  active?: boolean;
  roles: HandleRolesModel;
};

const NavBarItemContainer = styled.div<{ active?: boolean }>`
  display: inline-block;

  .inner {
    display: flex;
    padding: 0px 8px;
    margin: 0px 8px;
    align-items: center;
    flex-direction: column;
    position: relative;

    ${({ active }) => {
      if (!active) {
        return css`
          &:hover .activeIndicator {
            opacity: 1;
          }
        `;
      }
    }}
  }
`;

const ActiveIndicator = styled.div<{ active?: boolean }>`
  transition: height 320ms ease, opacity 220ms ease;
  height: 1px;
  opacity: 0;
  width: 90%;
  margin-top: 4px;
  border-radius: 2px;
  position: absolute;
  bottom: -14px;

  ${({ active }) => {
    if (active) {
      return css`
        height: 8px;
        opacity: 1;
      `;
    }
  }}
`;

export const NavBarItem = ({
  label,
  href,
  active,
}: NavBarItemProps): JSX.Element => {
  return (
    <NavBarItemContainer className="navBarItemContainer" active={active}>
      <div className="inner">
        <Link style={{ color: "unset", textDecoration: "none" }} href={href}>
          <p className="font-bold">{label}</p>
        </Link>
        <ActiveIndicator
          className="activeIndicator bg-black dark:bg-neutral-300"
          active={active}
        />
      </div>
    </NavBarItemContainer>
  );
};

export const NavBarActionContainer = styled.div`
  padding: 0px 16px;
  display: flex;
  align-items: center;
  height: 100%;
`;

export default NavBar;
