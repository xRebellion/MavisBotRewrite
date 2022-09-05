import { InteractionResponse } from "discord.js";
import { MusicManager } from "../managers/MusicManager";
import { BaseCommand } from "../types/BaseClasses";
import { RepliableInteraction } from "../types/RepliableInteraction";

class JoinCommand extends BaseCommand {

    constructor() {
        const commandName = "join";
        const commandDescription = "Make the bot join the voice channel you're in";
        super(commandName, commandDescription);
    }
    async execute(interaction: RepliableInteraction): Promise<InteractionResponse> {
        return MusicManager.join(interaction);
    }
}
export const command = new JoinCommand();