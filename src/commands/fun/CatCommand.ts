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

import { CommandInteraction, Message, MessageEmbed } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';
import CommandOptions from '../../types/CommandOptions';
import InteractionOptions from '../../types/InteractionOptions';
import axios from 'axios';
import path from 'path';
import { deleteFile, download } from '../../utils/util';

export default class CatCommand extends BaseCommand {
    supportsInteractions: boolean = true;
    coolDown = 8000;

    constructor() {
        super('cat', 'fun', []);
    }

    async run(client: DiscordClient, msg: Message | CommandInteraction, options: CommandOptions | InteractionOptions) {
        if (msg instanceof CommandInteraction) 
            await msg.deferReply();

        axios.get("https://api.thecatapi.com/v1/images/search", {
            headers: {
                "x-api-key": process.env.CAT_API_TOKEN!
            }
        })
        .then(res => {           
            if (res && res.status === 200) {
                let name = res.data[0].url;
                const pos = name.indexOf('?');

                if (pos !== -1) {
                    name = name.substring(0, pos);
                }

                name = name.split(/\/+/);
                name = name[name.length - 1];

                console.log(name);
                let filename = path.join(process.env.SUDO_PREFIX ?? path.join(__dirname, '../../..'), 'tmp', name);

                if (filename.endsWith('.false')) {
                    filename = filename.replace(/\.false$/, '.png');
                }

                download(res.data[0].url, filename)
                .then(async () => {
                    if (msg instanceof CommandInteraction) {
                        await msg.editReply({
                            files: [
                                {
                                    attachment: filename,
                                    name
                                }
                            ]
                        });
                    }
                    else {
                        await msg.reply({
                            files: [
                                {
                                    attachment: filename,
                                    name
                                }
                            ]
                        });
                    }
                    
                    await deleteFile(filename);
                })
                .catch(err => {
                    console.log("DL error: " + err.message);

                    deleteFile(filename);

                    if (msg instanceof CommandInteraction)
                        msg.editReply({
                            embeds: [
                                new MessageEmbed()
                                .setColor('#f14a60')
                                .setDescription('Internal API error occured (download-time error), please try again.')
                            ]
                        });
                    else
                        msg.reply({
                            embeds: [
                                new MessageEmbed()
                                .setColor('#f14a60')
                                .setDescription('Internal API error occured (download-time error), please try again.')
                            ]
                        });
                });
            }
            else if (res?.status === 429) {
                if (msg instanceof CommandInteraction)
                    msg.editReply({
                        embeds: [
                            new MessageEmbed()
                            .setColor('#f14a60')
                            .setDescription('Too many requests at the same time, please try again after some time.')
                        ]
                    });
                else
                    msg.reply({
                        embeds: [
                            new MessageEmbed()
                            .setColor('#f14a60')
                            .setDescription('Too many requests at the same time, please try again after some time.')
                        ]
                    });
            }
            else {
                if (msg instanceof CommandInteraction)
                    msg.editReply({
                        embeds: [
                            new MessageEmbed()
                            .setColor('#f14a60')
                            .setDescription('Internal API error occured (pre-download time error), please try again.')
                        ]
                    });
                else
                    msg.reply({
                        embeds: [
                            new MessageEmbed()
                            .setColor('#f14a60')
                            .setDescription('Internal API error occured (pre-download time error), please try again.')
                        ]
                    });
            }
        })
        .catch(err => {
            if (msg instanceof CommandInteraction)
                msg.editReply({
                    embeds: [
                        new MessageEmbed()
                        .setColor('#f14a60')
                        .setDescription('Too many requests at the same time, please try again after some time.')
                    ]
                });
            else
                msg.reply({
                    embeds: [
                        new MessageEmbed()
                        .setColor('#f14a60')
                        .setDescription('Too many requests at the same time, please try again after some time.')
                    ]
                });
        });
    }
}