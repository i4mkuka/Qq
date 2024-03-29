import { Message, Util } from "discord.js";
import DiscordClient from "../../client/Client";
import CommandOptions from "../../types/CommandOptions";
import BaseCommand from "../../utils/structures/BaseCommand";
import { google } from "googleapis";
import MessageEmbed from "../../client/MessageEmbed";
import { emoji } from "../../utils/Emoji";

export default class AIModStats extends BaseCommand {
    name = "aimodstats";
    category = "moderation";
    aliases = ['aimodtest'];

    async run(discordClient: DiscordClient, message: Message, options: CommandOptions) {
        if (options.args[0] === undefined) {
            await message.reply(":x: Please specify a text to test.");
            return;
        }

        if (!process.env.PERSPECTIVE_API_TOKEN) {
            return;
        }

        const DISCOVERY_URL = "https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1";
        const content = message.content.slice(discordClient.config.props[message.guildId!].prefix.length).trim().slice(options.cmdName.length).trim();
        const time = Date.now();

        google
            .discoverAPI(DISCOVERY_URL)
            .then((client) => {
                const analyzeRequest = {
                    comment: {
                        text: content,
                    },
                    requestedAttributes: {
                        TOXICITY: {},
                        THREAT: {},
                        SEVERE_TOXICITY: {},
                    },
                };

                (client.comments as any).analyze(
                    {
                        key: process.env.PERSPECTIVE_API_TOKEN,
                        resource: analyzeRequest,
                    },
                    (err: any, response: any) => {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        console.log(JSON.stringify(response.data.attributeScores, null, 4));

                        const config = discordClient.config.props[message.guildId!].ai_mod;
                        const threat = response.data.attributeScores.THREAT.summaryScore.value >= (config?.threat ?? 0.8);
                        const toxic = response.data.attributeScores.TOXICITY.summaryScore.value >= (config?.toxicity ?? 0.8);
                        const severeToxic = response.data.attributeScores.SEVERE_TOXICITY.summaryScore.value >= (config?.severe_toxicity ?? 0.8);

                        const embed = new MessageEmbed({
                            title: "AI Moderator Message Analysis",
                            description: `**Input Message:**\n\`\`\`\n${Util.escapeCodeBlock(content)}\`\`\``,
                            fields: [
                                {
                                    name: 'Analysis Results',
                                    value: `Toxicity: ${response.data.attributeScores.TOXICITY.summaryScore.value * 100}% (${(config?.toxicity ?? 0.8) * 100}% maximum)\nSevere Toxicity: ${response.data.attributeScores.SEVERE_TOXICITY.summaryScore.value * 100}% (${(config?.severe_toxicity ?? 0.8) * 100}% maximum)\nThreat: ${response.data.attributeScores.THREAT.summaryScore.value * 100}% (${(config?.threat ?? 0.8) * 100}% maximum)`
                                },
                            ],
                            footer: {
                                text: `Took ${((Date.now() - time) / 1000).toFixed(1)} seconds to analyze`
                            }
                        })
                        .setTimestamp();

                        if (toxic || threat || severeToxic) {
                            embed.addFields({
                                name: 'Summary',
                                value: `:x: This message is ${threat ? 'too threatful' : (toxic ? 'too toxic' : (severeToxic ? 'severely toxic' : ''))}`
                            });
                        }
                        else {
                            embed.addFields({
                                name: 'Summary',
                                value: `${emoji('check')} This message looks good.`
                            });
                        }

                        message.reply({ embeds: [embed] }).catch(console.log);
                    }
                )
            })
            .catch((err) => {
                console.log(err);
            });
    }
}