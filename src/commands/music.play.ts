import { CommandInteraction, InteractionResponse, SlashCommandStringOption } from "discord.js";
import { MusicManager } from "../managers/MusicManager";
import { BaseCommand } from "../types/BaseClasses";

class PlayCommand extends BaseCommand {

    constructor() {
        const commandName = "play";
        const commandDescription = "Plays a music from URL or song name";
        const options = [
            new SlashCommandStringOption()
                .setName("url-or-query")
                .setDescription("youtube link of the song or song name")
                .setRequired(true),
        ];
        super(commandName, commandDescription, options);
    }
    async execute(interaction: CommandInteraction): Promise<InteractionResponse> {
        return MusicManager.enqueue(interaction);
    }
}
export const command = new PlayCommand();