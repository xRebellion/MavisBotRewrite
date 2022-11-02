import { Collection } from "discord.js";
import { BaseCommand, BaseManager } from "../types/BaseClasses";
import { RepliableInteraction } from "../types/RepliableInteraction";
import fs from "fs";
import path from "path";
export class CommandManager extends BaseManager {
    commands: Collection<string, BaseCommand>;

    constructor(commandsPath: string) {
        super();
        this.commands = new Collection();
        this.init(commandsPath);
    }
    async init(commandsPath: string) {
        const commandFiles = fs.readdirSync(commandsPath);
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            if (!filePath.endsWith(".js")) continue;
            const c = await import(filePath);
            const command: BaseCommand = c.command;
            this.commands.set(command.name, command);
        }
    }

    execute(command: string, interaction: RepliableInteraction) {
        this.commands.get(command)?.execute(interaction);
    }
}