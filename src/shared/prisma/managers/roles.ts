import type { GuildRole, PrismaClient } from "@prisma/client";
import { pick } from "lodash";
import { CrudHandler } from "./interfaces";

export class RolesManager extends CrudHandler<GuildRole> {
  override client: PrismaClient;

  constructor(_client: PrismaClient) {
    super(_client, "guildRole");
    this.client = _client;
  }

  async upsertRole(data: GuildRole) {
    try {
      const guildRole = await this.client.guildRole.upsert({
        where: {
          id: data.id,
        },
        create: data,
        update: pick(data, ["name", "isAutoAssignable"]),
      });

      return {
        action: "upsert",
        guildRole,
      } as const;
    } catch (error) {
      console.log("prisma:error:upsertGuildRole: ", error);
    }
  }

  async autoAssignable() {
    return await this.client.guildRole.findMany({
      where: {
        isAutoAssignable: true,
      },
    });
  }

  async bulkInsertion(data: GuildRole[]) {
    return await this.client.guildRole.createMany({
      data,
    });
  }
}
