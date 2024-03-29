import axios from "axios";
import { Message, Util } from "discord.js";
import { emoji } from "../utils/Emoji";
import Service from "../utils/structures/Service";
import { parseUser } from '../utils/parseInput';
import MessageEmbed from "../client/MessageEmbed";
import { generateInfractionDescription } from "../utils/util";

export default class AIChat extends Service {
    enabled = false;

    async generateReply(input: string, message: Message): Promise<string | null> {
        if (!process.env.BRAIN_API_URL) {
            return null;
        }

        if (input.toLowerCase().startsWith('say ')) {
            return input.substring('say '.length - 1);
        }

        const matches = input.trim().toLowerCase().match(/^(f|fake)?ban( +)(<\@(\&)?\d+>)/gim);

        if (matches) {
            if (!message.member?.roles.cache.has(this.client.config.props[message.guildId!].mod_role)) {
                return "Are you kidding me? You don't have permission to do that.";
            }

            const userMention = matches[0].split(/ +/)[1];
            const user = await parseUser(this.client, userMention);

            if (user) {
                user.send({
                    embeds: [
                        new MessageEmbed({
                            author: {
                                name: `You have been banned in ${message.guild!.name}`,
                                iconURL: message.guild!.iconURL() ?? undefined
                            },
                            color: 0xf14a60,
                            description: generateInfractionDescription(this.client, message.guildId!, 'ban_message') + "\n|| Of course this is fake :joy: ||",
                            fields: [
                                {
                                    name: 'Reason',
                                    value: "This is an Automatic ban"
                                },
                                {
                                    name: 'Infraction ID',
                                    value: '0000'
                                }
                            ]
                        })
                    ]
                }).catch(console.error);
            }

            return `${emoji('check')} Successfully banned ${userMention}${matches[0].trim().startsWith('f') ? ' || This is fake :joy: LMAO ||' : ''}`;
        }

        try {
            const response = await axios.get(`${process.env.BRAIN_API_URL}&${new URLSearchParams({
                msg: input
            }).toString()}`);

            console.log(response);

            if (!response.data.cnt) {
                throw Error();
            }

            return response.data.cnt.replace(/<(\/?)tips>/gi, '');
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }
}