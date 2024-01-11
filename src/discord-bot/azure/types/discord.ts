import type { GuildUser } from "@prisma/client";
import type { ParsedMail } from "./mail";

export type PayloadProps = {
  title: string;
  description: string;
  mail: ParsedMail;
  ownerGuildUser?: GuildUser;
};
export type DiscordPayloadEmbedAuthor = { name: string };
export type DiscordPayloadEmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};
export type DiscordPayloadEmbedFooter = { text: string; icon_url: string };

export type DiscordPayloadEmbed = {
  author: DiscordPayloadEmbedAuthor;
  type: string;
  color: string;
  title: string;
  url: string;
  description: string;
  fields: DiscordPayloadEmbedField[];
  timestamp: string;
  footer: DiscordPayloadEmbedFooter;
};

export type DiscordPayload = {
  embeds: DiscordPayloadEmbed[];
};
