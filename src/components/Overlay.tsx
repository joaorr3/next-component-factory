import React from "react";
import styled from "styled-components";

export const OverlayContainer = styled.div`
  position: absolute;
  inset: 0;
  justify-content: center;
  align-items: center;
  display: flex;
  z-index: 130;
`;

export const OverlayWrapperStyled = styled.div`
  position: fixed;
  inset: 0;
  z-index: 130;
`;
export const OverlayStyled = styled.div<{ opacity?: number }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  opacity: ${({ opacity }) => opacity || 0};
  position: absolute;
  inset: 0;
  z-index: 130;
`;

export type OverlayProps = { opacity?: number; onPress?: () => void };

export const Overlay = ({
  opacity,
  onPress,
  children,
}: React.PropsWithChildren<OverlayProps>): JSX.Element => {
  return (
    <OverlayWrapperStyled onClick={onPress}>
      <OverlayStyled opacity={opacity} />
      <OverlayContainer>{children}</OverlayContainer>
    </OverlayWrapperStyled>
  );
};
