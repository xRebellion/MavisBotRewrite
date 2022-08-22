import { Client, Partials, IntentsBitField, ActivityType } from "discord.js";
import winston from "winston";
import { discordConfig } from "./config/discord";

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console(),
    ],
});

const client = new Client({
    intents: [IntentsBitField.Flags.GuildVoiceStates, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.Guilds],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.on('ready', () => {
    client.user?.setPresence({ activities: [{ name: 'paint dry', type: ActivityType.Watching }], status: 'online' });
    logger.info("Ready~");
});

client.login(discordConfig.TOKEN);



