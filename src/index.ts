import { registerCommands, registerEvents } from './utils/registry';
import DiscordClient from './client/Client';
import { IntentsBitField, Partials } from 'discord.js';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';
import { registrationEnd, registrationStart } from './utils/debug';
import { yellow } from './utils/util';

if (existsSync(path.join(__dirname, '../.env'))) {
    config();
}
else {
    process.env.ENV = 'prod';
}

if (process.argv.includes('--prod')) {
    console.warn(yellow('WARNING: Forcing production mode (--prod option passed)'));
    process.env.ENV = 'prod';
}

if (process.argv.includes('--dev')) {
    console.warn(yellow('WARNING: Forcing development mode (--dev option passed)'));
    process.env.ENV = 'dev';
}

const client = new DiscordClient({
    partials: [Partials.Channel, Partials.Message, Partials.Reaction],
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.DirectMessageTyping,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildBans,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildEmojisAndStickers,
    ]
}, path.resolve(__dirname, '..'));

(async () => {
    await registrationStart();
    await registerCommands(client, '../commands');
    await registrationEnd();
    
    await registrationStart();
    await registerEvents(client, '../events');
    await registrationEnd();
    
    await client.login(process.env.TOKEN);
})();