import BaseEvent from '../../utils/structures/BaseEvent';
import DiscordClient from '../../client/Client';
import { runTimeouts } from '../../utils/setTimeout';
import { ChannelType, Message, MessageReaction } from 'discord.js';

export default class MessageReactionAddEvent extends BaseEvent {
    constructor() {
        super('messageReactionAdd');
    }
    
    async run(client: DiscordClient, reaction: MessageReaction) {
        console.log('inside');
        
        if (!reaction || !reaction.message.guild || reaction.message.channel.type === ChannelType.DM) {
            return;
        }
        
        await (client.msg = <Message> reaction.message);
        await client.starboard.handle(reaction);
    }
}