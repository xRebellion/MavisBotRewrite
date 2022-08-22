import { Collection } from "discord.js";
import { BaseCommand, BaseManager } from "../types/BaseClasses";
import { RepliableInteraction } from "../types/RepliableInteraction";

class CommandManager extends BaseManager {
    commands: Collection<string, BaseCommand>;

    constructor() {
        super();
        this.commands = new Collection();
    }
    execute(command: string, interaction: RepliableInteraction) {
        this.commands.get(command)?.execute(interaction);
    }
}