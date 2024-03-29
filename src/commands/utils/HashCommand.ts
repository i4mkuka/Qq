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

import { Message, CommandInteraction } from "discord.js";
import DiscordClient from "../../client/Client";
import CommandOptions from "../../types/CommandOptions";
import InteractionOptions from "../../types/InteractionOptions";
import { emoji } from "../../utils/Emoji";
import BaseCommand from "../../utils/structures/BaseCommand";
import crypto, { BinaryToTextEncoding } from 'crypto';

export default class HashCommand extends BaseCommand {
    supportsInteractions = true;
    validAlgorithms = ['sha1', 'sha256', 'sha512', 'md5'];
    validDigestModes = ['hex', 'base64', 'base64url'];

    constructor() {
        super('hash', 'utils', []);
    }

    async run(client: DiscordClient, msg: Message | CommandInteraction, options: CommandOptions | InteractionOptions) {
        if (!options.isInteraction && options.args[1] === undefined) {
            await msg.reply({ content: `${emoji('error')} You must specify the hash algorithm and the content to hash!`, ephemeral: true });
            return;
        }

        if (msg instanceof CommandInteraction)
            await msg.deferReply({ ephemeral: true });

        const algo = (options.isInteraction ? options.options.getString("algorithm") : options.args.shift())!;
        const digest: BinaryToTextEncoding = options.isInteraction ? (options.options.getString("digest") ?? 'hex') as BinaryToTextEncoding : 'hex';

        if (!this.validAlgorithms.includes(algo)) {
            await this.deferReply(msg, {
                content: `${emoji('error')} Invalid algorithm given. Must be one of ${this.validAlgorithms.join(', ')}.`
            });

            return;
        }

        if (!this.validDigestModes.includes(digest)) {
            await this.deferReply(msg, {
                content: `${emoji('error')} Invalid digest mode given. Must be one of ${this.validDigestModes.join(', ')}.`
            });

            return;
        }

        const content = options.isInteraction ? options.options.getString("content") : options.args.join(' ');

        const hashsum = crypto.createHash(algo);
        hashsum.update(content!);
        const hashedData = hashsum.digest(digest);

        await this.deferReply(msg, {
            content: `**Hash (${algo}):**\n\`\`\`${hashedData}\`\`\``
        });
    }
}