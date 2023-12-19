import * as dotenv from 'dotenv'
import { c18Avatar } from '../../../shared/dataUtils';
import { channelNames } from '../../../shared/discord';

dotenv.config({
    path: `.env.${process.env.NODE_ENV || "local"}`,
});

const config = {
    token: process.env.DISCORD_TOKEN || "",
    pullRequestChannelName: channelNames.pr,
    avatar: c18Avatar
}

export default config