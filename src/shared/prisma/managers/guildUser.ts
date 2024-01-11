import type { GuildUser, PrismaClient } from "@prisma/client";
import { pick } from "lodash";

export class GuildUserManager {
  private client: PrismaClient;
  constructor(_client: PrismaClient) {
    this.client = _client;
  }

  async upsertGuildUser(data: GuildUser) {
    try {
      const guildUser = await this.client.guildUser.upsert({
        where: {
          id: data.id,
        },
        create: data,
        update: pick(data, [
          "username",
          "avatarURL",
          "friendlyName",
          "roles",
          "color",
        ]),
      });

      return {
        action: "upsert",
        guildUser,
      } as const;
    } catch (error) {
      console.log("prisma:error:updateGuildUser: ", error);
    }
  }

  async getNotionUserIdByGuildUserId(userId: string) {
    try {
      const user = await this.client.guildUser.findUnique({
        where: {
          id: userId,
        },
        include: {
          notionUser: true,
        },
      });

      if (user) {
        return user.notionUser?.notionUserId;
      }

      return undefined;
    } catch (error) {
      console.log("prisma:error:getGuildUser: ", error);
    }
  }

  async getGuildUserByFriendlyName(friendlyName: string) {
    const friendlyNameOnlyText = friendlyName.replace(/\s/g, "");
    const friendlyNameOnlyTextWithoutAccents = friendlyName.replace(
      /[^a-zA-Z]/g,
      ""
    );

    const user = await this.client.guildUser.findFirst({
      where: {
        OR: [
          {
            friendlyName: friendlyName,
          },
          {
            friendlyName: friendlyName.toUpperCase(),
          },
          {
            friendlyName: friendlyName.toLowerCase(),
          },
          {
            friendlyName: friendlyNameOnlyText,
          },
          {
            friendlyName: friendlyNameOnlyText.toUpperCase(),
          },
          {
            friendlyName: friendlyNameOnlyText.toLowerCase(),
          },
          {
            friendlyName: friendlyNameOnlyTextWithoutAccents,
          },
          {
            friendlyName: friendlyNameOnlyTextWithoutAccents.toUpperCase(),
          },
          {
            friendlyName: friendlyNameOnlyTextWithoutAccents.toLowerCase(),
          },
        ],
      },
    });

    return user;
  }
}
