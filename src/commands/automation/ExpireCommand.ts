/**
* This file is part of SudoBot.
* 
* Copyright (C) 2021-2022 OSN Inc.
*
* SudoBot is free software; you can redistribute it and/or modify it
* under the terms of the GNU Affero General Public License as published by 
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* SudoBot is distributed in the hope that it will be useful, but
* WITHOUT ANY WARRANTY; without even the implied warranty of 
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License 
* along with SudoBot. If not, see <https://www.gnu.org/licenses/>.
*/

import { CommandInteraction, Message, TextChannel } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';
import CommandOptions from '../../types/CommandOptions';
import InteractionOptions from '../../types/InteractionOptions';
import MessageEmbed from '../../client/MessageEmbed';
import ms from 'ms';
import ExpireMessageQueue from '../../queues/ExpireMessageQueue';

export default class ExpireCommand extends BaseCommand {
    supportsInteractions = true;
    
    constructor() {
        super('expire', 'automation', []);
    }

    async run(client: DiscordClient, msg: Message | CommandInteraction, options: CommandOptions | InteractionOptions) {
        if (!options.isInteraction && options.args[1] === undefined) {
            await msg.reply({
                embeds: [
                    new MessageEmbed()
                    .setColor('#f14a60')
                    .setDescription(`This command requires at least two arguments.`)
                ]
            });

            return;
        }

        const time = ms(options.isInteraction ? <string> await options.options.getString('time') : options.args[0]);

        if (!time) {
            await msg.reply({
                embeds: [
                    new MessageEmbed()
                    .setColor('#f14a60')
                    .setDescription(`Invalid time interval given.`)
                ]
            });

            return;
        }   

        let channel: TextChannel = <TextChannel> msg.channel;
        let text: string;
        
        if (options.isInteraction) {
            if (options.options.getChannel('channel')) {
                channel = <TextChannel> await options.options.getChannel('channel');
            }

            text = <string> await options.options.getString('content');
        }
        else if (msg instanceof Message) {
            const args = [...options.args];
            args.shift();

            if (msg.mentions.channels.last()) {
                channel = await <TextChannel> msg.mentions.channels.last();
                args.pop();
            }
            
            text = args.join(' ');
        }
        
        if (!channel.send) {
            await msg.reply({
                content: 'Invalid text channel.',
                ephemeral: true
            });

            return;
        }

        try {
            const message = await channel.send({
                content: text!
            });

            //const timeout = await setTimeoutv2('expire', time, msg.guild!.id, `expire ${time} ${text!} #${channel.name}`, message.id, channel.id, msg.guild!.id);

            const { id } = await client.queueManager.addQueue(ExpireMessageQueue, {
                data: {
                    messageID: message.id,
                    guildID: message.guild!.id,
                    channelID: message.channel.id
                },
                runAt: new Date(Date.now() + time),
                guild: message.guild!.id
            });

            await msg.reply({
                embeds: [
                    new MessageEmbed()
                    .setDescription('A queue job has been added.')
                    .setFooter({
                        text: `ID: ${id}` // timeout.row.id
                    })
                ],
                ephemeral: true
            });
        }
        catch(e) {
            console.log(e);

            await msg.reply({
                embeds: [
                    new MessageEmbed()
                    .setColor('#f14a60')
                    .setDescription(`I don't have enough permission to send messages on this channel.`)
                ]
            });

            return;
        }

        if (msg instanceof Message) {
            await msg.react('⏰');
        }
    }
}