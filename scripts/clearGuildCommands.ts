import { Routes } from "discord.js";
import { REST } from "discord.js";
import { discordConfig } from "../src/config/discord";
const GUILD_ID_TO_CLEAR_COMMANDS = "";
async function cleanGuildCommands() {
    const rest = new REST({ version: '10' }).setToken(discordConfig.TOKEN);

    rest.put(Routes.applicationGuildCommands(discordConfig.CLIENT_ID, GUILD_ID_TO_CLEAR_COMMANDS), { body: [] })
        .then(() => console.log('Successfully deleted all guild commands.'))
        .catch(console.error);
}

cleanGuildCommands();