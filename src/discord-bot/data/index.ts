import Prisma from "../../shared/prisma";

const prisma = Prisma.Instance;

export * as DataUtils from "./utils";

export default prisma;
