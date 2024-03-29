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

import { Message, CacheType, CommandInteraction } from "discord.js";
import Client from "../../client/Client";
import MessageEmbed from "../../client/MessageEmbed";
import CommandOptions from "../../types/CommandOptions";
import InteractionOptions from "../../types/InteractionOptions";
import { emoji } from "../../utils/Emoji";
import getUser from "../../utils/getUser";
import BaseCommand from "../../utils/structures/BaseCommand";

export default class AvatarLookupCommand extends BaseCommand {
    constructor() {
        super("avatarlookup", "information", ["avlookup", "pfplookup", "findpfp"]);
    }

    async run(client: Client, message: CommandInteraction<CacheType> | Message<boolean>, options: CommandOptions | InteractionOptions): Promise<void> {
        if (!options.isInteraction && options.args[0] === undefined) {
            await message.reply(`${emoji('error')} You must provide the user to lookup avatar.`);
            return;
        }

        const user = options.isInteraction ? options.options.getUser("user")! : await getUser(client, message as Message, options, 0);
        
        if (!user) {
            await message.reply(`${emoji('error')} That user does not exist.`);
            return;
        }

        await message.reply({
            embeds: [
                new MessageEmbed({
                    author: {
                        name: user.tag,
                        iconURL: user.displayAvatarURL()
                    },
                    description: `Generated Google Search URL: https://images.google.com/searchbyimage?image_url=${encodeURIComponent(user.displayAvatarURL())}`,
                    footer: {
                        text: `Avatar Lookup • ${user.id}`
                    }
                })
                .setTimestamp()
                .setThumbnail(user.displayAvatarURL())
            ]
        });
    }
}