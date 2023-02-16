import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { routes } from "../routes";
import { useGlobalState } from "../utils/GlobalState/GlobalStateProvider";

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
    <Link href={routes.User.path}>
      <Container show={!!profile}>
        <p className="mr-3 font-bold">{profile?.friendlyName}</p>

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
    </Link>
  );
};
