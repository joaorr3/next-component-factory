import Image from "next/image";
import styled from "styled-components";
import { useGlobalState } from "../utils/GlobalState/GlobalStateProvider";
import { Bold } from "./base";

const Container = styled.div<{ show?: boolean }>`
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 220ms ease-in;
  display: flex;
  flex-direction: row;
  margin: 0px 12px;
  align-items: center;
`;

export const UserAvatar = (): JSX.Element => {
  const {
    state: {
      user: { profile },
    },
  } = useGlobalState();

  return (
    <Container show={!!profile}>
      <Bold style={{ marginRight: 12 }}>{profile?.friendlyName}</Bold>

      {profile?.avatarURL && (
        <div style={{ borderRadius: 80, overflow: "hidden" }}>
          <Image
            src={profile.avatarURL}
            width={24}
            height={24}
            alt="user image"
          />
        </div>
      )}
    </Container>
  );
};
