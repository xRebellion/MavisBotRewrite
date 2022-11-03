import { Client, Partials, IntentsBitField, ActivityType } from "discord.js";
import winston from "winston";
import path from "path";
import { discordConfig } from "./config/discord";
import { CommandManager } from "./managers/CommandManager";

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
const commandManager = new CommandManager(path.join(__dirname, 'commands'));
client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

    const command = commandManager.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'There was an error while executing this command!' });
    }
});
client.login(discordConfig.TOKEN);



