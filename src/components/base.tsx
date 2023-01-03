import styled from "styled-components";

export const P = styled.p`
  /* color: ${({ theme: { textColor } }) => textColor}; */
`;

export const Bold = styled(P)`
  font-weight: 900;
`;

export const A = styled(P)`
  color: ${({ theme: { linkColor } }) => linkColor};
  cursor: pointer;
`;

export const Overlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
`;
