import type { FAQ, PrismaClient } from "@prisma/client";
import { CrudHandler } from "./interfaces";

export class FaqManager extends CrudHandler<FAQ> {
  override client: PrismaClient;

  constructor(_client: PrismaClient) {
    super(_client, "fAQ");
    this.client = _client;
  }
}
