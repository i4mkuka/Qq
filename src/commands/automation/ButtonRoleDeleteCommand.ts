import { Message, Interaction, CacheType, CommandInteraction } from "discord.js";
import Client from "../../client/Client";
import InteractionRole from "../../models/InteractionRole";
import InteractionRoleMessage from "../../models/InteractionRoleMessage";
import CommandOptions from "../../types/CommandOptions";
import InteractionOptions from "../../types/InteractionOptions";
import BaseCommand from "../../utils/structures/BaseCommand";

export default class ButtonRoleDeleteCommand extends BaseCommand {
    name = "buttonrole__delete";
    category = "automation";

    async run(client: Client, message: CommandInteraction<CacheType> | Message<boolean>, options: CommandOptions | InteractionOptions): Promise<void> {
        if (!options.isInteraction && options.args[1] === undefined) {
            await message.reply(":x: Please specify the ID of the react role message.");
            return;
        }

        if (message instanceof CommandInteraction)
            await message.deferReply();

        const interactionRoleMessage = await InteractionRoleMessage.findOne({ 
            message_id: options.isInteraction ? options.options.getString('message_id', true) : options.args[1],
            guild_id: message.guildId!
        });
        
        if (!interactionRoleMessage) {
            await this.deferReply(message, ":x: No such reaction role message created with that ID!");
            return;
        }

        await InteractionRole.deleteMany({ _id: { $in: interactionRoleMessage.dbIDs } });
        await interactionRoleMessage.delete();

        await this.deferReply(message, "The reaction role message data was deleted, but the message itself was not deleted by the system so that you won't lose any important data on it, if you have.");
    }
}