import { Base, Collection } from "discord.js";
import { BaseCommand, BaseManager } from "../types/BaseClasses";
import { RepliableInteraction } from "../types/RepliableInteraction";
import fs from "fs";
import path from "path";
export class CommandManager extends BaseManager {
    static commands: Collection<string, BaseCommand> = new Collection<string, BaseCommand>;

    static async _init(commandsPath: string) {
        const commandFiles = fs.readdirSync(commandsPath);
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            if (!filePath.endsWith(".js")) continue;
            const c = await import(filePath);
            const command: BaseCommand = c.command;
            this.commands.set(command.name, command);
        }
    }

    static execute(command: string, interaction: RepliableInteraction) {
        CommandManager.commands.get(command)?.execute(interaction);
    }
}
CommandManager._init(path.join(__dirname, "..", 'commands'));