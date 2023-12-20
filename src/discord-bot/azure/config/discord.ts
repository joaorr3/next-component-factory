import { env } from '../../../env/server';
import { c18Avatar } from '../../../shared/dataUtils';
import { channelNames } from '../../../shared/discord';

const config = {
    token: env.DISCORD_BOT_TOKEN || "",
    pullRequestChannelName: channelNames.pr,
    avatar: c18Avatar
}

export default config