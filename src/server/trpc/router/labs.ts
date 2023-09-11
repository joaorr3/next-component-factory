import type { Lab } from "@prisma/client";
import { ChannelType, PermissionsBitField } from "discord.js";
import { startCase } from "lodash";
import { z } from "zod";
import logger from "../../../shared/logger";
import type { PickRequired } from "../../../shared/utilityTypes";
import { normalizeLabLabel, wait } from "../../../shared/utils";
import { prismaNext } from "../../db/client";
import { discordNext } from "../../discord/client";
import { protectedProcedure, publicProcedure, router } from "../trpc";

const labSchema = z.custom<PickRequired<Lab, "displayName">>();

export const labsRouter = router({
  create: protectedProcedure
    .input(z.object({ lab: labSchema }))
    .mutation(async ({ input }) => {
      return await handleCreateLab(input.lab.displayName);
    }),
  read: protectedProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.id) {
        return await ctx.prisma.lab.findUnique({
          where: {
            id: input.id,
          },
        });
      }
      return null;
    }),
  all: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.lab.findMany();
  }),
  readMany: protectedProcedure.query(async () => {
    return await prismaNext.labs.readMany();
  }),
  findLabsByRoles: protectedProcedure
    .input(z.object({ rolesId: z.array(z.string()).optional() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.lab.findMany({
        where: {
          guildRoleId: {
            in: input.rolesId,
          },
        },
      });
    }),
  labWithMembers: publicProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ ctx, input: { id } }) => {
      return await ctx.prisma.lab.findUnique({
        where: {
          id,
        },
        include: {
          LabGuildUser: {
            include: {
              GuildUser: {
                include: {
                  User: true,
                },
              },
            },
          },
          GuildRole: true,
        },
      });
    }),
  update: protectedProcedure
    .input(z.object({ lab: labSchema, id: z.string() }))
    .mutation(async ({ input }) => {
      return await prismaNext.labs.update(input.lab, input.id);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await prismaNext.labs.delete(input.id);
    }),
});

const handleCreateLab = async (displayName?: string | null) => {
  if (!displayName) {
    return undefined;
  }

  console.log(" ");
  console.log(" ");

  logger.console.server({
    level: "info",
    message: `handleCreateLab.displayName: ${displayName}`,
  });

  try {
    const lab = {
      name: normalizeLabLabel(displayName, true),
      displayName: startCase(displayName),
      channelName: normalizeLabLabel(displayName),
    } as const;

    logger.console.server({
      level: "info",
      message: `lab: ${JSON.stringify(lab, undefined, 2)}`,
    });

    const newRole = await discordNext.guild?.roles.create({
      color: "DarkAqua",
      name: lab.name,
      mentionable: true,
      permissions: [PermissionsBitField.Flags.ViewChannel],
    });

    logger.console.server({
      level: "info",
      message: `newRole:: id:${newRole?.id} / name:${newRole?.name}`,
    });

    if (newRole) {
      // This is a bit optimistic, but lets try waiting for discord to sync the guild role we've just created before trying to upsert it manually.
      await wait(3000);
      const newRoleSave = await prismaNext.roles.upsertRole({
        id: newRole.id,
        name: newRole?.name,
        isAutoAssignable: true,
      });

      logger.console.server({
        level: "info",
        message: `newRoleSave: ${JSON.stringify(newRoleSave, undefined, 2)}`,
      });

      if (newRoleSave) {
        const newChannel = await discordNext.guild?.channels.create({
          name: lab.channelName,
          parent: "994876251045122169", // LABS
          type: ChannelType.GuildText,
          topic: `${lab.displayName} Channel`,
          // Maybe we don't need this since we're defining the parent.
          // permissionOverwrites: [
          //   {
          //     id: newRole.id,
          //     allow: [PermissionsBitField.Flags.ViewChannel],
          //   },
          //   {
          //     id: "977206962833997824", //CF
          //     allow: [PermissionsBitField.Flags.ViewChannel],
          //   },
          //   {
          //     id: "978344432069927003", //LABS
          //     allow: [PermissionsBitField.Flags.ViewChannel],
          //   },
          //   {
          //     id: "973878486739591208", //@everyone
          //     deny: [PermissionsBitField.Flags.ViewChannel],
          //   },
          // ],
        });

        logger.console.server({
          level: "info",
          message: `newChannel:: id:${newChannel?.id} / name:${newChannel?.name}`,
        });

        if (newChannel) {
          const newLab = await prismaNext.labs.create({
            name: lab.name,
            displayName: lab.displayName,
            channelName: newChannel.name,
            channelId: newChannel.id,
            guildRoleId: newRole.id,
          });

          logger.console.server({
            level: "info",
            message: `newLab: ${JSON.stringify(newLab, undefined, 2)}`,
          });

          console.log(" ");
          console.log(" ");

          if (newLab) {
            return newLab;
          }
        }
      }
    }

    return undefined;
  } catch (error) {
    console.log("error:handleCreateLab ", error);
  }
};
