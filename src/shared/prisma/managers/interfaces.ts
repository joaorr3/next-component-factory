import type { PrismaClient } from "@prisma/client";
import type { PickPartial } from "../../utilityTypes";

export interface CRUD<T extends { id: string | number }> {
  create(data: PickPartial<T, "id">): Promise<T>;
  read(id?: string | number): Promise<T | null>;
  readMany(): Promise<T[] | null>;
  update(data: Partial<T>, id: string | number): Promise<T>;
  delete(id: string | number): Promise<T>;
}

type Entity = keyof Pick<
  PrismaClient,
  | "account"
  | "session"
  | "user"
  | "issueIdMapping"
  | "logs"
  | "issue"
  | "kudos"
  | "guildUser"
  | "notionUser"
  | "pullRequest"
  | "fAQ"
  | "media"
  | "issuesMedia"
  | "genericMedia"
  | "component"
  | "guildRole"
  | "lab"
>;

export class CrudHandler<T extends { id: string | number }> implements CRUD<T> {
  client: PrismaClient;
  private entity: Entity;

  constructor(_client: PrismaClient, _entity: Entity) {
    this.client = _client;
    this.entity = _entity;
  }

  async create(data: PickPartial<T, "id">): Promise<T> {
    // @ts-ignore
    return this.client[this.entity].create({
      data,
    });
  }

  async read(id?: string | number): Promise<T | null> {
    // @ts-ignore
    return await this.client[this.entity].findFirst({
      where: {
        id,
      },
    });
  }

  async readMany(): Promise<T[] | null> {
    // @ts-ignore
    return await this.client[this.entity].findMany();
  }

  async update(data: Partial<T>, id: string | number): Promise<T> {
    // @ts-ignore
    return await this.client[this.entity].update({
      data,
      where: {
        id,
      },
    });
  }

  async delete(id: string | number): Promise<T> {
    // @ts-ignore
    return await this.client[this.entity].delete({
      where: {
        id,
      },
    });
  }
}
