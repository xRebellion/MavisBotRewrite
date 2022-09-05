import { ApplicationCommandOptionBase, InteractionResponse, SlashCommandBuilder } from "discord.js";
import { addOptions } from "../util/addOptions";
import { RepliableInteraction } from "./RepliableInteraction";

export abstract class BaseCommand {
    name: string;
    description: string;
    options: ApplicationCommandOptionBase[] | undefined;
    slashCommandBuilder: SlashCommandBuilder;
    constructor(name: string, description: string, options?: ApplicationCommandOptionBase[]) {
        this.name = name;
        this.description = description;
        this.options = options;
        this.slashCommandBuilder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        if (options !== undefined) {
            addOptions(this.slashCommandBuilder, options);
        }
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