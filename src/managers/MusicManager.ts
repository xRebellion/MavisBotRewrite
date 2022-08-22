import { Collection, InteractionResponse, Message } from "discord.js";
import { MusicPlayer } from "../modules/music/MusicPlayer";
import { BaseManager } from "../types/BaseClasses";
import { RepliableInteraction } from "../types/RepliableInteraction";

class MusicManager extends BaseManager {
    players: Collection<string, MusicPlayer>;

    constructor() {
        super();
        this.players = new Collection();
    }

    async join(interaction: RepliableInteraction): Promise<InteractionResponse> {
        return interaction.reply("joined");
    }
}