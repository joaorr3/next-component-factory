import type { LinkProps } from "next/link";
import Link from "next/link";
import React from "react";
import styled, { css } from "styled-components";
import { Bold } from "../components/base";
import { usePathMatch } from "../hooks/usePathMatch";
import { useRoles, type UseRoles } from "../hooks/useRoles";
import { navBarRouteEntries } from "../routes";

const NavBarContainer = styled.div`
  height: 64px;
  position: relative;
  width: 100%;
  /* box-shadow: 0px 4px 20px 4px #18181813; */
  position: fixed;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  backdrop-filter: blur(12px);
`;

const NavBar = ({ children }: React.PropsWithChildren) => {
  return (
    <React.Fragment>
      <NavBarContainer>{children}</NavBarContainer>
      <div style={{ height: 80 }} />
    </React.Fragment>
  );
};

export const NavBarContentContainer = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  align-items: center;
  padding: 0px 16px;
  padding-left: 0px;
`;

export const NavBarContent = (): JSX.Element => {
  const { matchPath } = usePathMatch();

  return (
    <NavBarContentContainer>
      {navBarRouteEntries.map(([_, { label, path, match, roles }]) => {
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
    </NavBarContentContainer>
  );
};

export type NavBarItemProps = Pick<LinkProps, "href"> & {
  label: string;
  active?: boolean;
  roles?: UseRoles;
};

const NavBarItemContainer = styled.div<{ active?: boolean }>`
  display: inline-block;

  .inner {
    display: flex;
    /* display: inline-block; */
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
  background-color: ${({ theme }) => theme.textColor};
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
  roles,
  active,
}: NavBarItemProps): JSX.Element => {
  const { valid } = useRoles(roles);

  if (!valid) {
    return <React.Fragment />;
  }

  return (
    <NavBarItemContainer className="navBarItemContainer" active={active}>
      <div className="inner">
        <Link style={{ color: "unset", textDecoration: "none" }} href={href}>
          <Bold>{label}</Bold>
        </Link>
        <ActiveIndicator className="activeIndicator" active={active} />
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
