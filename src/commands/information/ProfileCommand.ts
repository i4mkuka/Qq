import { ActivityType, ColorResolvable, CommandInteraction, GuildMember, Message, User } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';
import CommandOptions from '../../types/CommandOptions';
import InteractionOptions from '../../types/InteractionOptions';
import MessageEmbed from '../../client/MessageEmbed';
import e from 'express';
import getUser from '../../utils/getUser';
import getMember from '../../utils/getMember';
import { timeSince } from '../../utils/util';
import { roleMention } from '@discordjs/builders';

export default class ProfileCommand extends BaseCommand {
    supportsInteractions: boolean = true;

    constructor() {
        super('profile', 'information', []);
    }

    async run(client: DiscordClient, msg: Message | CommandInteraction, options: CommandOptions | InteractionOptions) {
        let user: GuildMember | null = null;

        if (msg instanceof CommandInteraction && options.isInteraction) {
            if (options.options.getMember('user'))
                user = <GuildMember> await options.options.getMember('user');
            else
                user = <GuildMember> msg.member!;
        }
        else if (msg instanceof Message && !options.isInteraction) {
            if (options.normalArgs[0]) {
                try {
                    const tempMember = await getMember(msg, options);

                    if (!tempMember)
                        throw new Error();
                    
                    user = tempMember;
                }
                catch (e) {
                    console.log(e);              
                    
                    await msg.reply({
                        embeds: [
                            new MessageEmbed()
                            .setColor('#f14a60')
                            .setDescription(':x: The user doesn\'t exist or not a member of this server.')
                        ]
                    });

                    return;
                }
            }
            else {
                user = msg.member!;
            }
        }

        const status = (s: 'idle' | 'online' | 'dnd' | 'invisible' | null | undefined): string => {
            if (s === 'idle')
                return 'Idle';
            else if (s === 'dnd') 
                return 'Do not disturb';
            else if (s === 'online')
                return 'Online';
            else if (s === undefined || s === null || s === 'invisible') 
                return 'Offline/Invisible';

            return s;
        };    

        const statusText = '' + ((user?.presence?.clientStatus?.desktop ? 'Desktop (' + status(user?.presence?.clientStatus?.desktop) + ')\n' : '') + (user?.presence?.clientStatus?.web ? 'Web (' + status(user?.presence?.clientStatus?.web) + ')\n' : '') + (user?.presence?.clientStatus?.mobile ? 'Mobile (' + status(user?.presence?.clientStatus?.mobile) + ')' : ''));
        const state = user?.presence?.activities.find(a => a.type === ActivityType.Custom)?.state;

        await msg.reply({
            embeds: [
                new MessageEmbed()
                .setColor(user!.user!.hexAccentColor ? user!.user!.hexAccentColor! : '#007bff')
                .setAuthor({
                    name: user?.user.tag!,
                    iconURL: user!.user.displayAvatarURL()
                })
                .setImage(user!.displayAvatarURL({
                    size: 4096
                }))
                .setURL(user!.displayAvatarURL({
                    size: 4096
                }))
                .setFields([
                    {
                        name: "ID",
                        value: `${user!.id}`
                    },
                    {
                        name: "Nickname",
                        value: `${user!.nickname?.replace(/\*\<\>\@\_\~\|/g, '') ?? '*Nickname not set*'}`
                    },
                    {
                        name: "Account Created",
                        value: `${user!.user.createdAt.toLocaleDateString('en-US')} (${timeSince(user!.user.createdTimestamp)})`
                    },
                    {
                        name: "Joined at",
                        value: `${user!.joinedAt!.toLocaleDateString('en-US')} (${timeSince(user!.joinedTimestamp!)})`
                    },
                    {
                        name: 'Active Devices',
                        value: `${statusText === '' ? 'Offline/Invisible' : statusText}`
                    },
                    {
                        name: 'Custom Status',
                        value: `${state ?? '*No custom status set*'}`
                    },
                    {
                        name: 'Roles',
                        value: user?.roles.cache.filter(role => role.id !== msg.guild!.id).reduce((acc, value) => `${acc} ${roleMention(value.id)}`, '')!.trim()!
                    }
                ])
            ]
        });
    }
}