import React from "react";
import styled, { keyframes } from "styled-components";
import { useRouterEvents } from "../hooks/useRouterEvents";
import { cn } from "../styles/utils";
import { OverlayStyled } from "./Overlay";

const rotate = keyframes`
  to {
    transform: rotate(-360deg);
  }
`;

const electrons = keyframes`
  0% {
    transform: scale(1);
    /* fill: #ee82ee; */
  }
  100% {
    transform: scale(1.4);
    /* fill: #5e0e94; */
  }
`;

const atom = keyframes`
  0% {
    transform: scale(1);
    /* fill: #ee82ee; */
  }
  100% {
    transform: scale(1.02);
    /* fill: #c35fc3; */
  }
`;

export const LoadingStyled = styled.svg`
  animation: ${rotate} 2s ease-in-out infinite;

  & .circle {
    fill: ${({ theme: { textColor } }) => textColor};
    /* fill: #ffffff; */
  }

  & .electrons {
    stroke-linecap: round;
    transform-origin: 50px 50px;
    animation: ${electrons} 0.4s ease-in-out infinite alternate;
  }

  & .electron1 {
    animation-delay: 100ms;
  }
  & .atom {
    transform-origin: 50px 50px;
    /* fill: #ee82ee; */
    animation: ${atom} 0.2s ease-in-out infinite alternate;
  }
  & .electron2 {
    animation-delay: 300ms;
  }
`;

const baseSize = 100;

const sizeMap = {
  xs: 0.2,
  sm: 0.4,
  md: 1,
  lg: 1.5,
} as const;

type LoadingSize = keyof typeof sizeMap;

export const Loading = ({
  size = "md",
  zIndex = 0,
}: {
  size?: LoadingSize;
  zIndex?: number;
}): JSX.Element => {
  return (
    <span style={{ zIndex, transform: `scale(${sizeMap[size]})` }}>
      <LoadingStyled
        height={baseSize}
        width={baseSize}
        style={{ display: "inline" }}
      >
        <circle className="circle electrons electron1" cx={80} cy={50} r={5} />
        <circle className="circle atom" cx={50} cy={50} r={20} />
        <circle className="circle electrons electron2" cx={20} cy={50} r={5} />
      </LoadingStyled>
    </span>
  );
};

const Loader = () => {
  useRouterEvents();

  return <React.Fragment />;

  // if (isLoading) {
  //   return (
  //     <Overlay opacity={0.95}>
  //       <Loading />
  //     </Overlay>
  //   );
  // }
};

/**
 * - needs to be wrapped in a div.relative
 */
const LoaderIsland = ({
  size = "sm",
  zIndex = 120,
  isLoading,
  overlayOpacity = 0.5,
  className,
}: {
  size?: LoadingSize;
  zIndex?: number;
  isLoading?: boolean;
  overlayOpacity?: number;
  className?: string;
}) => {
  if (!isLoading) {
    return <React.Fragment />;
  }

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
        className
      )}
      style={{ zIndex }}
    >
      {overlayOpacity > 0 && <OverlayStyled opacity={overlayOpacity} />}
      <Loading size={size} zIndex={140} />
    </div>
  );
};

Loader.Island = LoaderIsland;

export default Loader;
