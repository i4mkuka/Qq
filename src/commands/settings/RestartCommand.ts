import { ButtonStyle, CommandInteraction, GuildMember, Interaction, InteractionCollector, Message, MessageActionRowComponent, ButtonBuilder, MessageCollector, ActionRowBuilder, ComponentType, InteractionType } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';
import CommandOptions from '../../types/CommandOptions';
import InteractionOptions from '../../types/InteractionOptions';
import MessageEmbed from '../../client/MessageEmbed';
import { fetchEmoji } from '../../utils/Emoji';

export default class RestartCommand extends BaseCommand {
    supportsInteractions: boolean = true;
    supportsLegacy = false;
    ownerOnly = true;

    constructor() {
        super('restart', 'settings', []);
    }

    async run(client: DiscordClient, interaction: CommandInteraction, options: InteractionOptions) {
        const row = new ActionRowBuilder<ButtonBuilder>();

        row.addComponents([
            new ButtonBuilder()
            .setCustomId('restart:true')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
            .setCustomId('restart:false')
            .setLabel('No')
            .setStyle(ButtonStyle.Danger)
        ]);

        const disabledRow = new ActionRowBuilder<ButtonBuilder>();

        await disabledRow.addComponents([
            new ButtonBuilder()
            .setCustomId('restart:true')
            .setLabel('Restart')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
            new ButtonBuilder()
            .setCustomId('restart:false')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true)
        ]);

        await interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('System Restart')
                .setDescription('Are you sure to restart the system? This will restart the whole bot system including the backend API and might take up to a minute.')
            ],
            components: [row]
        });

        const reply = <Message> await interaction.fetchReply();

        const collector = new InteractionCollector(client, {
            channel: reply.channel,
            message: reply,
            componentType: ComponentType.Button,
            interactionType: InteractionType.MessageComponent,
            filter(i) {
                return i.isButton() && i.customId.startsWith('restart');
            },
            time: 15000
        });

        collector.on('collect', async i => {
            if (!i.isButton())
                return;
            
            if (i.member!.user.id !== interaction.member!.user.id) {
                await i.reply({
                    content: 'That\'s not your button.',
                    ephemeral: true
                });

                return;
            }

            if (i.customId === 'restart:true') {
                await i.update({
                    embeds: [
                        new MessageEmbed()
                        .setColor('#007bff')
                        .setTitle('System Restart')
                        .setDescription((await fetchEmoji('loading'))!.toString() + ' Restarting...')
                    ],
                    components: [disabledRow]
                });

                await client.startupManager.createLockFile({
                    date: new Date().toISOString(),
                    guild_id: i.guild!.id,
                    channel_id: i.channel!.id,
                    message_id: reply.id
                });

                await process.exit(0);
            }
            else {
                await i.update({
                    embeds: [
                        new MessageEmbed()
                        .setColor('Grey')
                        .setTitle('System Restart')
                        .setDescription('This action has been canceled.')
                    ],
                    components: [disabledRow]
                });
            }
        });

        collector.on('end', async i => {
            if (reply.embeds[0].hexColor === '#007bff') {
                await reply.edit({
                    embeds: [
                        new MessageEmbed()
                        .setColor('Grey')
                        .setTitle('System Restart')
                        .setDescription('This action has been canceled due to inactivity.')
                    ],
                    components: [disabledRow]
                });
            }
        });

        // reply.awaitMessageComponent({
        //     componentType: 'BUTTON',
        //     filter(i) {
        //         return i.customId.startsWith('restart') && i.member!.user.id === interaction.member!.user.id;
        //     },
        //     time: 15000
        // })
        // .then(async i => {
        //     if (i.customId === 'restart:true') {
        //         await i.update({
        //             embeds: [
        //                 new MessageEmbed()
        //                 .setColor('#007bff')
        //                 .setTitle('System Restart')
        //                 .setDescription((await fetchEmoji('loading'))!.toString() + ' Restarting...')
        //             ],
        //             components: [disabledRow]
        //         });

        //         await client.startupManager.createLockFile({
        //             date: new Date().toISOString(),
        //             guild_id: i.guild!.id,
        //             channel_id: i.channel!.id,
        //             message_id: reply.id
        //         });

        //         await process.exit(0);
        //     }
        //     else {
        //         await i.update({
        //             embeds: [
        //                 new MessageEmbed()
        //                 .setColor('GREY')
        //                 .setTitle('System Restart')
        //                 .setDescription('This action has been canceled.')
        //             ],
        //             components: [disabledRow]
        //         });
        //     }
        // })
        // .catch(async e => {
        //     console.log(e);
           
        //     await reply.edit({
        //         embeds: [
        //             new MessageEmbed()
        //             .setColor('GREY')
        //             .setTitle('System Restart')
        //             .setDescription('This action has been canceled due to inactivity.')
        //         ],
        //         components: [disabledRow]
        //     });
        // });
    }
}