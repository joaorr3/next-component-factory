import type { Kudos as KudosModel, PrismaClient } from "@prisma/client";

export class KudosManager {
  private client: PrismaClient;
  constructor(_client: PrismaClient) {
    this.client = _client;
  }

  async saveKudos(data: Omit<KudosModel, "id" | "timestamp">) {
    try {
      return await this.client.kudos.create({
        data,
      });
    } catch (error) {
      console.log("prisma:error:saveKudos: ", error);
    }
  }

  async getKudos() {
    try {
      return await this.client.kudos.findMany({
        include: {
          to: true,
        },
      });
    } catch (error) {
      console.log("prisma:error:getKudos: ", error);
    }
  }
}
