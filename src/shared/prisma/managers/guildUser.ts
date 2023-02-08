import type { GuildUser, PrismaClient } from "@prisma/client";

export class GuildUserManager {
  private client: PrismaClient;
  constructor(_client: PrismaClient) {
    this.client = _client;
  }

  async updateGuildUser(data: GuildUser) {
    try {
      const user = await this.client.guildUser.findFirst({
        where: {
          id: data.id,
        },
      });
      if (user) {
        const { notionUserId: _, id: __, azureUserId: ___, ...restData } = data;
        const guildUser = await this.client.guildUser.update({
          where: {
            id: user.id,
          },
          data: restData,
        });

        return {
          action: "updated",
          guildUser,
        } as const;
      } else {
        const guildUser = await this.client.guildUser.create({
          data,
        });

        return {
          action: "created",
          guildUser,
        } as const;
      }
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
}
