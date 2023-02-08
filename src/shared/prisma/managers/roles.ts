import type { GuildRole, PrismaClient } from "@prisma/client";
import { CrudHandler } from "./interfaces";

export class RolesManager extends CrudHandler<GuildRole> {
  override client: PrismaClient;

  constructor(_client: PrismaClient) {
    super(_client, "guildRole");
    this.client = _client;
  }

  async bulkInsertion(data: GuildRole[]) {
    return await this.client.guildRole.createMany({
      data,
    });
  }
}
