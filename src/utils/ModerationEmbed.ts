import { User, APIEmbed, EmbedData } from 'discord.js';
import MessageEmbed from '../client/MessageEmbed';

export default class ModerationEmbed extends MessageEmbed {
	constructor(protected user: User, protected mod: User, options: APIEmbed | EmbedData = {}) {
		super({
			author: {
				name: user.tag,
				iconURL: user.displayAvatarURL()
			},
			...options
		} as (APIEmbed | EmbedData));
		
		this.addField('Executor', `Tag: ${mod.tag}\nID: ${mod.id}`);

		this.setFooter({
			text: `${user.id}`
		});

		this.setTimestamp();
		
		this.setColor('#007bff');
	}

	public setReason(reason: string | null | undefined) {
		if (reason) {
			this.addField('Reason', reason);
		}
		else {
			this.addField('Reason', '*No reason provided*');
		}

		return this;
	}
}
