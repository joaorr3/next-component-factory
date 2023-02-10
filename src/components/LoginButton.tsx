import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";
import styled from "styled-components";
import {
  useGlobalState,
  useLoading,
} from "../utils/GlobalState/GlobalStateProvider";

export type IconProps = {
  onPress?: () => void;
};

const IconStyled = styled.div`
  width: 24px;
  height: 24px;
  svg {
    fill: ${({ theme: { textColor } }) => textColor};
  }
  cursor: pointer;
`;

export const Icon = ({
  children,
  onPress,
}: React.PropsWithChildren<IconProps>): JSX.Element => {
  return <IconStyled onClick={onPress}>{children}</IconStyled>;
};

export const LoginIcon = ({ onPress }: IconProps): JSX.Element => {
  return (
    <Icon onPress={onPress}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={24}
        width={24}
        viewBox="0 0 48 48"
      >
        <path d="M24.45 42v-3H39V9H24.45V6H39q1.2 0 2.1.9.9.9.9 2.1v30q0 1.2-.9 2.1-.9.9-2.1.9Zm-3.9-9.25L18.4 30.6l5.1-5.1H6v-3h17.4l-5.1-5.1 2.15-2.15 8.8 8.8Z" />
      </svg>
    </Icon>
  );
};
export const LogoutIcon = ({ onPress }: IconProps): JSX.Element => {
  return (
    <Icon onPress={onPress}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={24}
        width={24}
        viewBox="0 0 48 48"
      >
        <path d="M9 42q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h14.55v3H9v30h14.55v3Zm24.3-9.25-2.15-2.15 5.1-5.1h-17.5v-3h17.4l-5.1-5.1 2.15-2.15 8.8 8.8Z" />
      </svg>
    </Icon>
  );
};

export const LoginButton = (): JSX.Element => {
  const { data: sessionData } = useSession();
  const { actions } = useGlobalState();
  const { setLoading } = useLoading();

  const handleLogout = React.useCallback(() => {
    setLoading(true);
    signOut()
      .then(() => {
        actions.removeUser();
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  const handleLogin = React.useCallback(() => {
    signIn("discord", {
      callbackUrl: "/",
    });
  }, []);

  if (sessionData) {
    return <LogoutIcon onPress={handleLogout} />;
  }
  return <LoginIcon onPress={handleLogin} />;
};
