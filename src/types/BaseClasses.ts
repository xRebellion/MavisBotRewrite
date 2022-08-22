import { InteractionResponse, SlashCommandBuilder } from "discord.js";
import { RepliableInteraction } from "./RepliableInteraction";

export abstract class BaseCommand {
    name: string;
    description: string;
    slashCommandBuilder: SlashCommandBuilder;
    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
        this.slashCommandBuilder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }

    public getSlashCommandBuilder(): SlashCommandBuilder {
        return this.slashCommandBuilder;
    }

    abstract execute(interaction: RepliableInteraction): Promise<InteractionResponse>;
}

export abstract class BaseManager {
    constructor() {
        return;
    }
}