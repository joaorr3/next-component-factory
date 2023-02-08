import type { PrismaClient, Lab } from "@prisma/client";
import { CrudHandler } from "./interfaces";

export class LabsManager extends CrudHandler<Lab> {
  override client: PrismaClient;
  constructor(_client: PrismaClient) {
    super(_client, "lab");
    this.client = _client;
  }
}
