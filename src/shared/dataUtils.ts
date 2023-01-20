import type { Kudos, GuildUser } from "@prisma/client";
import { uniqBy, groupBy } from "lodash";

type Input = (Kudos & {
  to: GuildUser | null;
})[];

export const discordAvatar = ({
  userId,
  avatarId,
}: {
  userId?: string;
  avatarId?: string;
}) => {
  if (userId && avatarId) {
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.png`;
  }
  return "";
};

export type ParsedKudos = {
  user: {
    name: string;
    avatarURL: string | null;
    color: string | null;
  };
  kudos: { [key: string]: number };
};

export const parseKudos = (kudos?: Input) => {
  const results = [] as ParsedKudos[];

  const distinctUsers = uniqBy(kudos, "toId").map(
    ({ toId, to }): GuildUser => ({
      id: toId || "",
      username: to?.username || "",
      friendlyName: to?.friendlyName || "",
      avatarURL: to?.avatarURL || "",
      color: to?.color || "",
      isBot: !!to?.isBot,
      roles: to?.roles || "",
      notionUserId: to?.notionUserId || null,
      azureUserId: to?.azureUserId || null,
    })
  );
  const grouped = groupBy(kudos, "toId");
  distinctUsers.forEach(({ id, friendlyName, username, avatarURL, color }) => {
    if (id) {
      const byType = groupBy(grouped[id], "type");
      const reduced = Object.entries(byType).reduce((acc, [k, v]) => {
        acc[k] = v.length;
        return acc;
      }, {} as { [key: string]: number });

      results.push({
        user: { name: friendlyName || username, avatarURL, color },
        kudos: reduced,
      });
    }
  });

  return results;
};

export const getArtifactUrl = (id?: string) =>
  `https://dev.azure.com/ptbcp/IT.Ignite/_artifacts/feed/BCP.Ignite.Dx.ComponentFactory/Npm/@bcp-nextgen-dx-component-factory%2Faccolade-design-system/overview/${id}`;

export const npmInstallHint = (version?: string) =>
  `npm install @bcp-nextgen-dx-component-factory/accolade-design-system@${version}`;
