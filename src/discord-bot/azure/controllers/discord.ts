import type { ParsedMail } from './../types/mail';
import type { DiscordPayloadEmbedField, PayloadProps } from '../types/discord';

import config from "../config/discord"

import type { Client, MessageCreateOptions, TextChannel} from "discord.js";
import { roleMention} from "discord.js";
import { discordSharedClient } from '../../../shared/discord';

class AzureDiscord {

  private client

  constructor(client: Client<boolean>){
    this.client = client
  }

  async processMail(mail: ParsedMail){
    try{
      await this.refreshCache()
      this.normalizeTitle(mail)

      if(mail.isCreated){
        return await this.createPullRequest(mail)
      }
  
      if(mail.isCompleted || mail.isAbandoned){
        return await this.closePullRequest(mail)
      }
  
      return await this.updatePullRequest(mail)
    }catch(error){
      console.log("azure:discord:error:processMail ", error)
    }
  }

  private async createPullRequest(mail: ParsedMail){

    const payload = this.createPayload({
      title: mail.pullRequest.title,
      description: mail.action,
      mail,
    })

    const channelName = config.pullRequestChannelName
    const channel = this.getChannelByName(channelName)
    
    if(!channel){
      throw new Error(`Channel [${channelName}] not found`)
    }

    const thread = await channel.threads.create({
      name: mail.pullRequest.title,
      reason: mail.action,
      autoArchiveDuration: 10080,
    });

    await thread.join()
    await thread.send(payload)
  }

  private async updatePullRequest(mail: ParsedMail){

    let description = mail.pullRequest.title

    if((mail.isCommented || mail.isCommenteReplied) && mail.comment){
      description = mail.comment
    }

    if(mail.isUpdated){
      description = "Need to approve again"
    }

    if(mail.isApproved){
      description = ":white_check_mark: Approved"
    }

    if(mail.isAutoComplete){
      description = ":timer: Auto Complete"
    }

    const payload = this.createPayload({
      title: mail.action,
      description,
      mail,
    })

    const channelName = config.pullRequestChannelName
    const channel = this.getChannelByName(config.pullRequestChannelName)

    if(!channel){
      throw new Error(`Channel [${channelName}] not found`)
    }

    const threadName = mail.pullRequest.title
    const thread = this.getThreadInChannelByName(channel, threadName)

    if(!thread){
      throw new Error(`Thread [${threadName}] not found in channel [${channelName}]`)
    }

    await thread.send(payload)

  }

  private async closePullRequest(mail: ParsedMail){

    let description = mail.pullRequest.title

    if(mail.isCompleted){
      description = ":white_check_mark: Finished"
    }

    if(mail.isAbandoned){
      description = ":no_entry_sign: Canceled"
    }

    const payload = this.createPayload({
      title: mail.action,
      description,
      mail,
    })

    const channelName = config.pullRequestChannelName
    const channel = this.getChannelByName(config.pullRequestChannelName)

    if(!channel){
      throw new Error(`Channel [${channelName}] not found`)
    }

    const threadName = mail.pullRequest.title
    const thread = this.getThreadInChannelByName(channel, threadName)

    if(!thread){
      throw new Error(`Thread [${threadName}] not found in channel [${channelName}]`)
    }
    
    await thread.send(payload)
    await thread.setArchived(true);
  }

  private createPayload({title, description, mail}: PayloadProps): MessageCreateOptions {
    const reviewersFields:DiscordPayloadEmbedField[] = []

    if(mail.reviewers){
      const reviwers = mail.reviewers?.map(reviewer => ({
        name: reviewer.user,
        value: reviewer.approved ? ":white_check_mark:" : ":clock3:",
        inline: true,
      }))

      reviewersFields.push(...reviwers)
    }

    const embedMessage = discordSharedClient.embed({
      title,
      url: mail.pullRequest.url,
      description,
      author: {
        name: mail.author,
      },
      fields: [
        { name: '\u200B', value: '\u200B' },
        { name: 'Reviewers', value: 'Selected reviewers' },
        ...reviewersFields
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'see this update',
        iconURL: config.avatar,
      },
    });


    const guildDevRole = discordSharedClient.role('dev')

    const payload: MessageCreateOptions = {
      content: guildDevRole ? roleMention(guildDevRole.id) : undefined,
      embeds: [embedMessage],
    }

    return payload
  }

  private normalizeTitle(mail: ParsedMail){
    mail.pullRequest.title = mail.pullRequest.title.replace(":", "")
  }

  private async refreshCache(){
    await this.client.guilds.fetch()
  }

  private getChannelByName(channelName: string){
    for(const cachedChannel of this.client.channels.cache){
      const channel = cachedChannel[1] as TextChannel
      if(channel.name === channelName){
        return channel
      }
    }
  }

  private getThreadInChannelByName(channel: TextChannel, threadName: string){
    for(const cachedThread of channel.threads.cache){
      const thread = cachedThread[1]
      if(thread.name === threadName && !thread.archived){
        return thread
      }
    }
  }
  
}

export default AzureDiscord