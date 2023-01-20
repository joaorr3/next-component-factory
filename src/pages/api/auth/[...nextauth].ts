import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, {
  type Account,
  type Awaitable,
  type CallbacksOptions,
  type NextAuthOptions,
  type Profile,
} from "next-auth";
import { type AdapterUser } from "next-auth/adapters";
import DiscordProvider, {
  type DiscordProfile,
} from "next-auth/providers/discord";
import { env } from "../../../env/server";
import { prisma } from "../../../server/db/client";

const callbacks: Partial<CallbacksOptions<Profile, Account>> | undefined = {
  session({ session, user }) {
    if (session.user) {
      session.user.id = user.id;
    }
    return session;
  },
};

const prismaAdapter = PrismaAdapter(prisma);

export const authOptions: NextAuthOptions = {
  callbacks,
  adapter: {
    ...prismaAdapter,
    createUser(data) {
      return prisma.user.create({
        data: data as Omit<AdapterUser, "id"> & { discordUserId: string },
      }) as Awaitable<AdapterUser>;
    },
  },
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      profile(profile: DiscordProfile) {
        if (profile.avatar === null) {
          const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
        } else {
          const format = profile.avatar.startsWith("a_") ? "gif" : "png";
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
        }
        return {
          discordUserId: profile.id,
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: profile.image_url,
        };
      },
    }),
  ],
};

export default NextAuth(authOptions);
