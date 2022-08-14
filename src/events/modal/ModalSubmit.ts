import BaseEvent from '../../utils/structures/BaseEvent';
import { ChannelType, GuildMember, Interaction, Message, ModalMessageModalSubmitInteraction } from 'discord.js';
import DiscordClient from '../../client/Client';
import { ModalSubmitInteraction } from 'discord-modals';

// FIXME: Fix event handling
export default class ModalSubmitEvent extends BaseEvent {
    constructor() {
        super('modalInteraction');
    }

    async run(client: DiscordClient, interaction: ModalMessageModalSubmitInteraction) {
        if (!interaction.guild || !interaction.channel || interaction.channel.type === ChannelType.DM) {
            if (interaction.isRepliable())
                await interaction.reply({
                    content: 'You cannot use this bot on DMs.',
                    ephemeral: true
                }); 

            return;
        }   

        if ((global as any).lastCommand) {
            const cmd = client.commands.get((global as any).lastCommand);

            if (cmd && cmd.supportsInteractions) {
                const allowed = await client.auth.verify(interaction.member! as GuildMember, cmd);

                if (!allowed) {
                    return;
                }

                await cmd.modalSubmit(client, interaction);
            }
        }
    }
}