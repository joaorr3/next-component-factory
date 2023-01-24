import React from "react";
import styled, { keyframes } from "styled-components";
import { useLoading } from "../utils/GlobalState/GlobalStateProvider";
import { Overlay } from "./Overlay";

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

const size = 100;

export const Loading = (): JSX.Element => {
  return (
    <LoadingStyled height={size} width={size}>
      <circle className="circle electrons electron1" cx={80} cy={50} r={5} />
      <circle className="circle atom" cx={50} cy={50} r={20} />
      <circle className="circle electrons electron2" cx={20} cy={50} r={5} />
    </LoadingStyled>
  );
};

const Loader = () => {
  const { isLoading } = useLoading();

  if (isLoading) {
    return (
      <Overlay opacity={0.95}>
        <Loading />
      </Overlay>
    );
  }

  return <React.Fragment />;
};

export default Loader;
