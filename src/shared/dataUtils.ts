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
      defaultLabId: to?.defaultLabId || null,
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

export const getPrUrl = (id?: string) =>
  `https://dev.azure.com/ptbcp/IT.DIT/_git/BCP.DesignSystem/pullrequest/${id}`;

export const getArtifactUrl = (id?: string) =>
  `https://dev.azure.com/ptbcp/IT.Ignite/_artifacts/feed/BCP.Ignite.Dx.ComponentFactory/Npm/@bcp-nextgen-dx-component-factory%2Faccolade-design-system/overview/${id}`;

export const npmInstallHint = (version?: string) =>
  `npm install @bcp-nextgen-dx-component-factory/accolade-design-system@${version}`;

export const c18Avatar =
  "https://cdn.discordapp.com/avatars/1000309925643309127/b40e96bd5967560f43a4762379c086f6";

// Are we being too restrictive?
export const acceptedFileTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/mpeg",
  "video/quicktime",
];
