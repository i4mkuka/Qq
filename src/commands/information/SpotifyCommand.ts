import { formatDistanceToNowStrict } from "date-fns";
import { CommandInteraction, GuildMember, Message, MessageActionRow, MessageButton } from "discord.js";
import DiscordClient from "../../client/Client";
import MessageEmbed from "../../client/MessageEmbed";
import CommandOptions from "../../types/CommandOptions";
import InteractionOptions from "../../types/InteractionOptions";
import getUser from "../../utils/getUser";
import BaseCommand from "../../utils/structures/BaseCommand";

export default class SpotifyCommand extends BaseCommand {
    name = "spotify";
    category = "information";
    aliases = ["music"];
    supportsInteractions = true;

    async run(client: DiscordClient, message: CommandInteraction | Message, options: CommandOptions | InteractionOptions) {
        const member = <GuildMember> (options.isInteraction ? options.options.getMember('member') ?? message.member! : (
            options.args[0] ? await getUser(client, message as Message, options, 0) : message.member!
        ));

        const listeningActivity = member.presence?.activities.find(a => a.type === 'LISTENING' && a.name === 'Spotify');

        if (!listeningActivity) {
            await message.reply(`${member.id === message.member!.user.id ? 'You are' : 'The user is'} not listening to Spotify.`);
            return;
        }

        const url = listeningActivity.syncId ? `https://open.spotify.com/track/${listeningActivity.syncId}` : null;
        `:notes: Listening to **Spotify**: ${url ? '[' : '**'}${listeningActivity.state?.replace(/\;/, ',')} - ${listeningActivity.details}${url ? '](' + url + ')' : '**'}`;

        console.log(listeningActivity.assets?.smallImageURL());

        await message.reply({
            embeds: [
                new MessageEmbed({
                    author: {
                        name: member.user.tag,
                        iconURL: member.user.displayAvatarURL()
                    },
                    thumbnail: {
                        url: listeningActivity.assets?.smallImageURL() ?? listeningActivity.assets?.largeImageURL() ?? undefined
                    },
                    description: `:notes: **${member.user.toString()}** is listening ${url ? '[' : '**'}${listeningActivity.state?.replace(/\;/, ',')} - ${listeningActivity.details}${url ? '](' + url + ')' : '**'}`,
                    fields: [
                        {
                            name: 'Activity Start Date',
                            value: `${listeningActivity.createdAt.toUTCString()} (${formatDistanceToNowStrict(listeningActivity.createdAt, { addSuffix: true })})`
                        }
                    ],
                    footer: {
                        text: 'Listening to Spotify',
                        iconURL: 'https://media.discordapp.net/attachments/969258443754074143/1056571821350203513/991px-Spotify_icon.png'
                    }
                })
            ],
            components: url ? [
                new MessageActionRow<MessageButton>()
                    .addComponents(
                        new MessageButton()
                            .setStyle("LINK")
                            .setURL(url!)
                            .setLabel("Listen Along")
                    )
            ] : undefined
        });
    }
}