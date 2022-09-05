import { InteractionResponse } from "discord.js";
import { BaseCommand } from "../types/BaseClasses";
import { RepliableInteraction } from "../types/RepliableInteraction";
class PingCommand extends BaseCommand {

    constructor() {
        const commandName = "ping";
        const commandDescription = "Sends a Pong!";
        super(commandName, commandDescription);
    }
    async execute(interaction: RepliableInteraction): Promise<InteractionResponse> {
        return interaction.reply("Pong!");
    }
}
module.exports = new PingCommand();