import { ActivityType, ClientPresenceStatus, CommandInteraction, GuildMember, Interaction, Message, PresenceStatus, PresenceStatusData } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';
import CommandOptions from '../../types/CommandOptions';
import InteractionOptions from '../../types/InteractionOptions';
import MessageEmbed from '../../client/MessageEmbed';
import { fetchEmoji } from '../../utils/Emoji';

export default class SetStatusCommand extends BaseCommand {
    supportsInteractions: boolean = true;
    ownerOnly = true;

    constructor() {
        super('setstatus', 'settings', []);
    }

    async run(client: DiscordClient, message: Message | CommandInteraction, options: CommandOptions | InteractionOptions) {
        if (!options.isInteraction && options.args[0] === undefined) {
            await message.reply({
                content: 'This command requires at least one argument'
            });

            return;
        }

        if (message instanceof CommandInteraction) 
            await message.deferReply();
        
        await this.deferReply(message, {
            content: 'Status updated.'
        });

        let status: ClientPresenceStatus | undefined;
        let activity: string;
        let type: Exclude<ActivityType, ActivityType.Custom> = ActivityType.Watching;

        if (options.isInteraction) {
            activity = <string> options.options.getString('activity');

            if (options.options.getString('status'))
                status = <ClientPresenceStatus> options.options.getString('status');

            if (options.options.getString('type'))
                if (options.options.getString('type') === 'WATCHING')
                    type = ActivityType.Watching;
                else if (options.options.getString('type') === 'PLAYING')
                    type = ActivityType.Playing;
                else if (options.options.getString('type') === 'LISTENING')
                    type = ActivityType.Listening;
                else if (options.options.getString('type') === 'STREAMING')
                    type = ActivityType.Streaming;
                else if (options.options.getString('type') === 'COMPETING')
                    type = ActivityType.Competing;
        }
        else {
            activity = options.args.join(' ');
        }

        await client.randomStatus.update(activity, type, status);
    }
}