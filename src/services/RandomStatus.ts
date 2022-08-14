import { ActivityOptions, ActivityType, PresenceStatusData } from "discord.js";
import DiscordClient from "../client/Client";
import { random } from "../utils/util";

export default class RandomStatus {
    constructor(protected client: DiscordClient) {
           
    }

    async update(name?: string, type?: Exclude<ActivityType, ActivityType.Custom>, status?: PresenceStatusData) {
        status ??= random(['dnd', 'idle', 'online'] as PresenceStatusData[]);
        console.log(status);
        
        await this.client.user?.setActivity({
            type: type ?? ActivityType.Watching,
            name: name ?? 'over the server'
        });

        await this.client.user?.setStatus(status!);
    }
}