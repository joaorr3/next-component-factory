import Link from "next/link";
import React from "react";
import styled, { keyframes } from "styled-components";
import { useRoles } from "../../hooks/useRoles";
import { routes } from "../../routes";
import { cn } from "../../styles/utils";

const translate = keyframes`
  to {
    transform: translateX(-50%);
  }
`;

const FancyBackground = styled.div`
  animation: ${translate} 2s linear infinite;
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    115deg,
    #4fcf70,
    #fad648,
    #a767e5,
    #12bcfe,
    #44ce7b
  );
  background-size: 50% 100%;
`;
const base = /*tw*/ `
  max-w-max
  cursor-pointer
  rounded-2xl
  p-3
  font-bold
  select-none
  flex
  items-center
  overflow-hidden
  relative
`;

export const NewIssueShortcut = (): JSX.Element => {
  // const { valid } = useRoles(routes.IssueOpen.roles);

  // if (!valid) {
  //   return <React.Fragment />;
  // }

  return (
    <Link href="/issue/open" className="mr-3">
      <div className={cn(base)}>
        <FancyBackground />
        <div
          className="absolute inset-0 z-10 bg-neutral-100 bg-opacity-90 dark:bg-neutral-800"
          style={{
            margin: 1,
            borderRadius: 15,
          }}
        />

        <p className="z-20">New Issue</p>
      </div>
    </Link>
  );
};
