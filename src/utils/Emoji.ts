import { Emoji } from "discord.js";
import DiscordClient from "../client/Client";

function globalConfig() {
    return DiscordClient.client.config.props.global;
}

export function fetchEmoji(name: string) {    
    return findEmoji(e => e.name === name);
}

export function fetchEmojiStr(name: string) {    
    return (findEmoji(e => e.name === name))?.toString();
}

export function findEmoji(callback: (e: Emoji) => boolean) {
    return DiscordClient.client.guilds.cache.find(g => g.id === globalConfig().id)!.emojis.cache.find(callback);
}