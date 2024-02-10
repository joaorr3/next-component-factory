import { PrismaClient } from "@prisma/client";
import {
  IssuesManager,
  KudosManager,
  GuildUserManager,
  LabsManager,
  RolesManager,
  FaqManager,
  PullRequestsManager,
} from "./managers";

class Prisma {
  public client: PrismaClient;

  public issues: IssuesManager;
  public kudos: KudosManager;
  public guildUser: GuildUserManager;
  public labs: LabsManager;
  public roles: RolesManager;
  public faq: FaqManager;
  public pullRequests: PullRequestsManager;

  private static _instance: Prisma = new Prisma();

  private constructor() {
    this.client = new PrismaClient();

    this.issues = new IssuesManager(this.client);
    this.kudos = new KudosManager(this.client);
    this.guildUser = new GuildUserManager(this.client);
    this.labs = new LabsManager(this.client);
    this.roles = new RolesManager(this.client);
    this.faq = new FaqManager(this.client);
    this.pullRequests = new PullRequestsManager(this.client);
  }

  public static get Instance(): Prisma {
    return this._instance;
  }
}

export const prismaSharedClient = Prisma.Instance;

export default Prisma;
