import styled from "styled-components";

export const P = styled.p`
  /* color: ${({ theme: { textColor } }) => textColor}; */
`;

export const Bold = styled(P)`
  /* display: inline-block; */
  font-weight: 600;
`;

export const A = styled(P)`
  /* color: ${({ theme: { linkColor } }) => linkColor}; */
  cursor: pointer;
`;
