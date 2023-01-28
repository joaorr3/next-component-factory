import * as dotenv from 'dotenv'
import { c18Avatar, GuildChannelName } from '../../bot/constants';
dotenv.config({
    path: `.env.${process.env.NODE_ENV || "local"}`,
});

const config = {
    token: process.env.DISCORD_TOKEN || "",
    pullRequestChannelName: GuildChannelName.pr,
    avatar: c18Avatar
}

export default config