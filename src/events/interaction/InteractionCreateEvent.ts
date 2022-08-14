import BaseEvent from '../../utils/structures/BaseEvent';
import { BaseInteraction, ChannelType, GuildMember, Interaction, Message } from 'discord.js';
import DiscordClient from '../../client/Client';
import CommandOptions from '../../types/CommandOptions';
import InteractionOptions from '../../types/InteractionOptions';
import AutoCompleteOptions from '../../types/AutoCompleteOptions';
import MessageEmbed from '../../client/MessageEmbed';

export default class InteractionCreateEvent extends BaseEvent {
    constructor() {
        super('interactionCreate');
    }

    async run(client: DiscordClient, interaction: BaseInteraction) {
        if (!interaction.guild || !interaction.channel || interaction.channel.type === ChannelType.DM) {
            if (interaction.isRepliable())
                await interaction.reply({
                    content: 'You cannot use this bot on DMs.',
                    ephemeral: true
                }); 

            return;
        }

        if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
            await client.setMessage(interaction);

            const { commandName } = interaction;

            const command = await client.commands.get(commandName);

            if (command && ((interaction.isChatInputCommand() && command.supportsInteractions) || (interaction.isContextMenuCommand() && command.supportsContextMenu))) {
                const allowed = await client.auth.verify(interaction.member! as GuildMember, command);

                if (!allowed) {
                    await interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setColor('#f14a60')
                            .setDescription(":x: You don't have permission to run this command.")
                        ],
                        ephemeral: true
                    });

                    return;
                }

                const options = {
                    cmdName: commandName,
                    options: interaction.options,
                    isInteraction: true
                } as InteractionOptions;

                if (!await client.cooldown.start(interaction, options))
                    return;

                await command.execute(client, interaction, options);
                (global as any).lastCommand = commandName;
            }
        }
        else if (interaction.isAutocomplete()) {
            await client.setMessage(interaction);

            const { commandName } = interaction;

            const command = await client.commands.get(commandName);

            if (command && command.supportsInteractions) {
                const allowed = await client.auth.verify(interaction.member! as GuildMember, command);

                if (!allowed) {
                    return;
                }

                if (!(await command.perms(client, interaction))) {
                    return;
                }

                const options = {
                    cmdName: commandName,
                    options: interaction.options,
                    isInteraction: true,
                    optionName: interaction.options.getFocused(true).name,
                    query: interaction.options.getFocused(true).value.toString()
                } as AutoCompleteOptions;

                await command.autoComplete(client, interaction, options);
                (global as any).lastCommand = commandName;
            }
        }
        else {
            if (!(global as any).commandName)
                return;

            await client.setMessage(interaction);

            const command = await client.commands.get((global as any).commandName);

            if (command && command.supportsInteractions) {
                const allowed = await client.auth.verify(interaction.member! as GuildMember, command);

                if (!allowed) {
                    return;
                }
                
                if (!(await command.perms(client, interaction))) {
                    return;
                }

                await command.default(client, interaction);
            }
        }
    }
}