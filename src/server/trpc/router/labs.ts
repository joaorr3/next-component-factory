import type { Lab } from "@prisma/client";
import { ChannelType, PermissionsBitField } from "discord.js";
import { startCase } from "lodash";
import { z } from "zod";
import type { PickRequired } from "../../../shared/utilityTypes";
import { normalizeLabLabel } from "../../../shared/utils";
import { prismaNext } from "../../db/client";
import { discordNext } from "../../discord/client";
import { protectedProcedure, router } from "../trpc";

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
      return await ctx.prisma.lab.findUnique({
        where: {
          id: input.id,
        },
      });
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
  labWithMembers: protectedProcedure
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
  try {
    const lab = {
      name: normalizeLabLabel(displayName, true),
      displayName: startCase(displayName),
      channelName: normalizeLabLabel(displayName),
    } as const;

    const newRole = await discordNext.guild?.roles.create({
      color: "DarkAqua",
      name: lab.name,
      mentionable: true,
      permissions: [PermissionsBitField.Flags.ViewChannel],
    });

    if (newRole) {
      const newRoleSave = await prismaNext.roles.create({
        id: newRole.id,
        name: newRole?.name,
        isAutoAssignable: true,
      });

      if (newRoleSave) {
        const newChannel = await discordNext.guild?.channels.create({
          name: lab.channelName,
          parent: "994876251045122169", // LABS
          type: ChannelType.GuildText,
          topic: `${lab.displayName} Channel`,
          permissionOverwrites: [
            {
              id: newRole.id,
              allow: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: "977206962833997824", //CF
              allow: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: "978344432069927003", //LABS
              allow: [PermissionsBitField.Flags.ViewChannel],
            },
          ],
        });

        if (newChannel) {
          const newLab = await prismaNext.labs.create({
            name: lab.name,
            displayName: lab.displayName,
            channelName: newChannel.name,
            channelId: newChannel.id,
            guildRoleId: newRole.id,
          });

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
