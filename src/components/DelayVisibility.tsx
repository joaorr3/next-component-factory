import React from "react";
import styled from "styled-components";

export type DelayVisibilityProps = React.PropsWithChildren<{
  /**
   * In milliseconds
   */
  delayTime?: number;
  /**
   * In milliseconds
   */
  transitionTime?: number;
}>;

const Wrapper = styled.span<
  Omit<DelayVisibilityProps, "children"> & { isMounted: boolean }
>`
  opacity: ${({ isMounted }) => (isMounted ? 1 : 0)};
  transition: opacity ${({ transitionTime }) => transitionTime}ms ease-in;
  transition-delay: ${({ delayTime }) => delayTime}ms;
`;

export const DelayVisibility = ({
  transitionTime = 200,
  delayTime = 200,
  children,
}: DelayVisibilityProps): JSX.Element => {
  const isMounted = React.useRef(false);

  React.useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <Wrapper
      isMounted={isMounted.current}
      transitionTime={transitionTime}
      delayTime={delayTime}
    >
      {children}
    </Wrapper>
  );
};