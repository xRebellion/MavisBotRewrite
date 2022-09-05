import { ApplicationCommandOptionBase, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

export function addOptions(slashCommandBuilder: SlashCommandBuilder, options: ApplicationCommandOptionBase[]) {
    for (const option of options) {
        if (option instanceof SlashCommandStringOption) {
            slashCommandBuilder.addStringOption(option);
        }
    }
}