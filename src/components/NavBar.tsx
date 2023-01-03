import React from "react";
import styled from "styled-components";

const NavBarContainer = styled.div`
  height: 48px;
  position: relative;
  width: 100%;
  background-color: ${({ theme: { backgroundColor } }) => backgroundColor};
  box-shadow: 0px 4px 20px 4px #18181813;
  position: fixed;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  transition-property: color, background-color;
  transition-duration: 220ms;
  transition-timing-function: ease;
`;

const NavBar = ({ children }: React.PropsWithChildren) => {
  return (
    <React.Fragment>
      <NavBarContainer>{children}</NavBarContainer>
      <div style={{ height: 80 }} />
    </React.Fragment>
  );
};

export default NavBar;
