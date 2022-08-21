import { Client, Partials, IntentsBitField } from "discord.js";
const client = new Client({
    intents: [IntentsBitField.Flags.GuildVoiceStates, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.Guilds],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});
