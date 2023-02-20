import type { GuildUser } from "@prisma/client";
import { userMention } from "discord.js";
import { z } from "zod";
import { rolesParser } from "../../../shared/roles";
import { wait } from "../../../shared/utils";
import { discordNext } from "../../discord/client";

import { protectedProcedure, router } from "../trpc";

export const userRouter = router({
  registeredUsers: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      include: {
        GuildUser: {
          include: {
            DefaultLab: true,
            LabGuildUser: {
              include: {
                Lab: true,
              },
            },
          },
        },
      },
    });
  }),
  allGuildUsers: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.guildUser.findMany({
      include: {
        User: true,
        DefaultLab: true,
        LabGuildUser: {
          include: {
            Lab: true,
          },
        },
      },
    });
  }),
  detail: protectedProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ ctx, input: { id } }) => {
      if (!id) {
        return undefined;
      }
      const user = await ctx.prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          GuildUser: true,
        },
      });

      return user?.GuildUser;
    }),
  current: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      include: {
        GuildUser: true,
      },
    });

    return user?.GuildUser;
  }),
  userLabs: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: {
        id: ctx.session.user.id,
      },
      include: {
        GuildUser: {
          include: {
            LabGuildUser: {
              include: {
                Lab: true,
              },
            },
          },
        },
      },
    });

    return user?.GuildUser.LabGuildUser.map(({ Lab }) => ({
      id: Lab.id,
      name: Lab.displayName || Lab.name,
    }));
  }),
  updateDefaultUserLab: protectedProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        defaultLabId: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.defaultLabId === undefined) {
        return undefined;
      }

      if (input.userId) {
        await ctx.prisma.guildUser.update({
          where: {
            id: input.userId,
          },
          data: {
            defaultLabId: input.defaultLabId,
          },
        });
      } else {
        await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            GuildUser: {
              update: {
                defaultLabId: input.defaultLabId,
              },
            },
          },
        });
      }
    }),
  updateUserLabs: protectedProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        labs: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.labs) {
        return undefined;
      }

      if (input.userId) {
        await ctx.prisma.guildUser.update({
          where: {
            id: input.userId,
          },
          data: {
            LabGuildUser: {
              deleteMany: {},
            },
          },
        });

        await ctx.prisma.guildUser.update({
          where: {
            id: input.userId,
          },
          data: {
            LabGuildUser: {
              createMany: {
                data: input.labs.map((labId) => ({ labId })),
                skipDuplicates: true,
              },
            },
          },
        });
      } else {
        await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            GuildUser: {
              update: {
                LabGuildUser: {
                  deleteMany: {},
                },
              },
            },
          },
        });

        await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            GuildUser: {
              update: {
                LabGuildUser: {
                  createMany: {
                    data: input.labs.map((labId) => ({ labId })),
                    skipDuplicates: true,
                  },
                },
              },
            },
          },
        });
      }
    }),
  labUsersWithoutProjectRole: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.guildUser.findMany();

    const outArray = [] as Pick<GuildUser, "id" | "username">[];

    for (const { id: userId, username, roles } of users) {
      const userRoles = rolesParser(roles);

      const tempUser = {
        autoAssignableRoles: new Array<string>(),
        ignore: false,
      };

      if (userRoles) {
        for (const { name } of userRoles) {
          const isAutoAssignable =
            discordNext.roleIsAutoAssignable(name) &&
            name !== discordNext.roleNames.labs;

          const isCF = name === discordNext.roleNames.cf;
          const isBot = name === "BOT";

          if (isCF || isBot) {
            tempUser.ignore = true;
          }

          if (isAutoAssignable) {
            tempUser.autoAssignableRoles.push(name);
          }
        }
      }

      if (!tempUser.autoAssignableRoles.length && !tempUser.ignore) {
        outArray.push({
          id: userId,
          username,
        });
      }
    }

    return outArray;
  }),
  notifyLabUsersWithoutProjectRole: protectedProcedure
    .input(
      z.object({
        users: z.array(
          z.object({
            id: z.string(),
            username: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      console.log("notifyLabUsersWithoutProjectRole:input: ", input);
      const users = input.users;

      const mentionString = users.map((u) => userMention(u.id)).join(" ");

      const info = [
        `Hey, ${mentionString}!\n`,
        "I've notice you don't have a project role.",
        "Here's a list of the roles you can assign to yourself with the **/roles** command.\n",
        discordNext.autoAssignableRoles.map((r) => `• ${r}`).join("\n"),
      ];

      await discordNext.sendMessage("roles", {
        content: info.join("\n"),
      });
      await discordNext.sendMessage("roles", {
        content:
          "https://component-factory-s3-bucket.s3.eu-west-2.amazonaws.com/generic/d5dd03cc-27c9-4aca-851a-36d85cbd0d14__how_to_roles_cmd.gif",
      });
    }),
  tempBatchUpdateUserLabs: protectedProcedure.mutation(async ({ ctx }) => {
    const users = await ctx.prisma.guildUser.findMany();
    console.log(`Processing ${users.length} users..`);

    for (const { id: userId, roles } of users) {
      const userRoles = rolesParser(roles);

      if (userRoles) {
        for (const { id: roleId } of userRoles) {
          const lab = await ctx.prisma.lab.findUnique({
            where: {
              guildRoleId: roleId,
            },
          });

          if (lab) {
            const updatedUser = await ctx.prisma.guildUser.update({
              where: {
                id: userId,
              },
              data: {
                LabGuildUser: {
                  upsert: {
                    where: {
                      labId_guildUserId: {
                        guildUserId: userId,
                        labId: lab.id,
                      },
                    },
                    create: {
                      labId: lab.id,
                    },
                    update: {
                      labId: lab.id,
                    },
                  },
                },
              },
            });

            console.log("Updated: ", {
              user: updatedUser.friendlyName,
              lab: lab.displayName,
            });
          }
          await wait(200);
        }
      }

      await wait(200);
    }
  }),
});
