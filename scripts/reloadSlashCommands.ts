import { Routes } from "discord.js";
import { REST, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import fs from "fs";
import path from "path";
import { BaseCommand } from "../src/types/BaseClasses";
import { discordConfig } from "../src/config/discord";
async function reloadCommands() {
    const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
    const commandPath = path.join(__dirname, '..', 'src', 'commands');
    const commandFiles = fs.readdirSync(commandPath).filter(file => !file.startsWith('command'));
    for (const file of commandFiles) {
        const filePath = path.join(commandPath, file);
        const c = await import(filePath);
        const command: BaseCommand = c.default;

        commands.push(command.getSlashCommandBuilder().toJSON());
    }
    const rest = new REST({ version: '10' }).setToken(discordConfig.TOKEN);

    rest.put(Routes.applicationCommands(discordConfig.CLIENT_ID), { body: commands })
        .then(() => console.info('Successfully registered application commands.'))
        .catch(console.error);
}

reloadCommands();