/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ParsedMail, ParsedMailCommit, ParsedMailReviewer } from './../types/mail';
import { load } from "cheerio"
import { MailReceiver } from 'simple-mail-receiver'
import { parseTable } from '@pedroentringer/cheerio-table-parser';
import EventEmitter from 'node:events'

import config from "../config/mail.js"
import getAuthor from '../utils/people.js';
import captalize from "../utils/captalize.js";

class AzureMail extends EventEmitter{

    private mailReceiver: MailReceiver
    private autoReconnect: boolean
    private actions = [
        {type: "completed", config: { isCompleted: true }},
        {type: "commented", config: { isCommented: true }},
        {type: "replied", config: { isCommenteReplied: true }},
        {type: "approved", config: { isApproved: true }},
        {type: "pushed", config: { isUpdated: true }},
        {type: "abandoned", config: { isAbandoned: true }},
        {type: "created", config: { isCreated: true }},
        {type: "set", command: "auto-complete", config: { isAutoComplete: true }},
    ]

    constructor({ autoReconnect = false }){
        super()

        this.autoReconnect = autoReconnect

        this.mailReceiver = new MailReceiver(config.connect);

        this.connect()
    }
    
    fakeMail(mailHtml: string){
        this.parseMail(mailHtml)
    }

    private connect(){
        this.mailReceiver
            .on('end', () => {
                if(this.autoReconnect){
                    this.connect()
                }
            })
            .on('mail', (mail: any) => this.readMail(mail))
            .on('error', (error: any) => {
                if(error?.code === "ETIMEDOUT" && this.autoReconnect){
                    this.connect()
                }else{
                    this.emit('error', error)
                }
            })
            .start()
    }

    private readMail(mail: any){
        const { from, html, uid } = mail
        const isFromAzure = config.validation.azureAddress === from.value[0].address

        if(isFromAzure){
            this.mailReceiver.markSeen(uid)
            this.parseMail(html)
        }
    }

    private getActionConfig(mailAction: string){
        const author = getAuthor(mailAction)

        for(const action of this.actions){
            if(mailAction.includes(action.type)){
                if(!action.command){
                    return {
                        author,
                        ...action.config
                    }
                }

                if(mailAction.includes(action.command)){
                    return {
                        author,
                        ...action.config
                    }
                }
            }
        }
    }

    private parseMail(mailHtml: string) {
        const $ = load(mailHtml);

        const title = $("table > tbody > tr:nth-child(1) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > table > tbody > tr > td > table")
    
        const action = $($("td, th", $("tbody > tr", title).get(1)).get(0)).text().trim()
        const pullRequestTitle = $($("td, th", $("tbody > tr", title).get(0)).get(0)).text().trim()
        const pullRequestLink = $($("td, th", $("tbody > tr ", title).last()).get(0)).children("a").first().attr()?.href || ""
        const pullRequestComment = $($(".x_comment").children("p").get(1)).text().trim()
        const pullRequestLinkSplited = pullRequestLink.split("?")[0].split("/")
        const pullRequestId = parseInt(pullRequestLinkSplited[pullRequestLinkSplited.length - 1])
        
        const reviewersTable = $("table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table").html() || ""

        const reviewers: ParsedMailReviewer[] = parseTable(reviewersTable, { headers: ["user", "icon", "status", "type"]})
            .map( (reviewer: any) => ({
                user: captalize(reviewer.user),
                approved: reviewer.status === "Approved",
                isRequired: reviewer.type === "Required",
            }))
            .sort( (a:any, b:any) => (a.approved === b.approved)? 0 : a.approved? -1 : 1)

        const commits: ParsedMailCommit[] = []

        $("table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr").each((id, row) => {
            const info = $("span", row).last().text().trim()

            const commit = {
                id: $("span", row).first().text().trim(), 
                title: $("p", row).text().trim(), 
                createdAt: info.replace(`• ${getAuthor(info, false)} • `, ""), 
                author: getAuthor(info),
                url: $("a", row).attr()?.href || ""
            }

            commits.push(commit)
        })

        const actionConfig = this.getActionConfig(action)

        if(actionConfig){
            const parsedMail:ParsedMail = {
                action,
                ...actionConfig,
                pullRequest: {
                    id: pullRequestId,
                    title: pullRequestTitle,
                    url: pullRequestLink,
                }
            }
    
            if(pullRequestComment){
                parsedMail.comment = pullRequestComment
            }
    
            if(reviewers.length > 0){
                parsedMail.reviewers = reviewers
            }
    
            if(commits.length > 0){
                parsedMail.commits = commits
            }
    
            this.emit('mail', parsedMail)
        }
        
    }


}

export default AzureMail