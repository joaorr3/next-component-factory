import type { PrismaClient } from "@prisma/client";
import type { PickPartial } from "../../utilityTypes";

export interface CRUD<T extends { id: string | number }> {
  create(data: PickPartial<T, "id">): Promise<T | null>;
  read(id?: string | number): Promise<T | null>;
  readMany(): Promise<T[] | null>;
  update(data: Partial<T>, id: string | number): Promise<T | null>;
  delete(id: string | number): Promise<T | null>;
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

  async create(data: PickPartial<T, "id">): Promise<T | null> {
    try {
      // @ts-ignore
      return this.client[this.entity].create({
        data,
      });
    } catch (error) {
      console.log(`error -> [CrudHandler.create[${this.entity}]]`, error);
      return null;
    }
  }

  async read(id?: string | number): Promise<T | null> {
    try {
      if (id) {
        // @ts-ignore
        return await this.client[this.entity].findUnique({
          where: {
            id,
          },
        });
      }
      return null;
    } catch (error) {
      console.log(`error -> [CrudHandler.read[${this.entity}]]`, error);
      return null;
    }
  }

  async readMany(): Promise<T[] | null> {
    try {
      // @ts-ignore
      return await this.client[this.entity].findMany();
    } catch (error) {
      console.log(`error -> [CrudHandler.readMany[${this.entity}]]`, error);
      return null;
    }
  }

  async update(data: Partial<T>, id: string | number): Promise<T | null> {
    try {
      // @ts-ignore
      return await this.client[this.entity].update({
        data,
        where: {
          id,
        },
      });
    } catch (error) {
      console.log(`error -> [CrudHandler.update[${this.entity}]]`, error);
      return null;
    }
  }

  async delete(id: string | number): Promise<T | null> {
    try {
      // @ts-ignore
      return await this.client[this.entity].delete({
        where: {
          id,
        },
      });
    } catch (error) {
      console.log(`error -> [CrudHandler.delete[${this.entity}]]`, error);
      return null;
    }
  }
}
