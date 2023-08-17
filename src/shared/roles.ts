import { type PrismaClient } from "@prisma/client";
import { type Session } from "next-auth";
import { z } from "zod";

export const Roles = {
  admin: "976885627066933248",
  cf: "977206962833997824",
  dev: "976884124449116342",
  labs: "978344432069927003",
  test: "test",
} as const;

export type RolesKeys = keyof typeof Roles;

const roleValidator = z.object({
  id: z.string(),
  name: z.string(),
  hexColor: z.string(),
});

export type UserRole = z.infer<typeof roleValidator>;

const rolesValidator = z.array(roleValidator);

export type Role = z.infer<typeof roleValidator>;

export const rolesParser = (rolesString?: string | null) => {
  if (rolesString) {
    const parsed = rolesValidator.parse(JSON.parse(rolesString));
    return parsed;
  }
  return undefined;
};

export const getUserRoles = async (session: Session, prisma: PrismaClient) => {
  const user = await prisma.user.findUnique({
    where: {
      id: session.user?.id,
    },
    include: {
      GuildUser: true,
    },
  });

  if (user) {
    const userRoles = rolesParser(user.GuildUser.roles);
    return userRoles;
  }
  return undefined;
};
