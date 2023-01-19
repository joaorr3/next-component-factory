import React from "react";
import styled from "styled-components";

export const OverlayContainer = styled.div`
  position: relative;
  min-height: 100vh;
  min-width: 100vw;
  justify-content: center;
  align-items: center;
  display: flex;
  z-index: 100;
`;

export const OverlayWrapperStyled = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
`;
export const OverlayStyled = styled.div<{ opacity?: number }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  opacity: ${({ opacity }) => opacity || 0};
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  /* backdrop-filter: blur(10px); */
  /* background-color: #00000090; */
`;

export type OverlayProps = { opacity?: number };

export const Overlay = ({
  opacity,
  children,
}: React.PropsWithChildren<OverlayProps>): JSX.Element => {
  return (
    <OverlayWrapperStyled>
      <OverlayStyled opacity={opacity} />
      <OverlayContainer>{children}</OverlayContainer>
    </OverlayWrapperStyled>
  );
};
