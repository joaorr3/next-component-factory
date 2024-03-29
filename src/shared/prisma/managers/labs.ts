import type { Lab, PrismaClient } from "@prisma/client";
import { CrudHandler } from "./interfaces";

export class LabsManager extends CrudHandler<Lab> {
  override client: PrismaClient;
  constructor(_client: PrismaClient) {
    super(_client, "lab");
    this.client = _client;
  }

  async updateLabByChannelId(channelId: string, data: Partial<Lab>) {
    try {
      const lab = await this.client.lab.findFirst({
        where: {
          channelId,
        },
      });

      if (lab) {
        return await this.client.lab.update({
          where: {
            channelId,
          },
          data,
        });
      }
    } catch (error) {
      console.log("error -> [LabsManager.updateLabByChannelId]: ", error);
    }
  }
}
