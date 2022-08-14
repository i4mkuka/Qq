import { APIEmbed, APIEmbedField, EmbedBuilder as MessageEmbedDiscord, EmbedData, RestOrArray } from 'discord.js';

export default class MessageEmbed extends MessageEmbedDiscord {
    constructor(options?: APIEmbed | EmbedData) {
        const timestamp = options?.timestamp;

        if (options?.timestamp) {
            delete options.timestamp;
        }

        super(options);
        
        if (timestamp) {
            this.setTimestamp(typeof timestamp === 'string' ? new Date(timestamp) : timestamp);
        }
        
        this.setColor('#007bff');
    }

    addField(field: APIEmbedField | string, value?: string, inline: boolean = false): this {
        if (typeof field === 'string') {
            this.addFields({ 
                name: field,
                value: value!,
                inline
            });

            return this;
        }

        return this.addFields(field);
    }
}