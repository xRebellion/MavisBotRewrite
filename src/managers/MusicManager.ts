import { Collection, GuildMember, InteractionResponse, PermissionsBitField } from "discord.js";
import { MusicPlayer } from "../modules/music/MusicPlayer";
import { BaseManager } from "../types/BaseClasses";
import { RepliableInteraction } from "../types/RepliableInteraction";

export class MusicManager extends BaseManager {
    static players: Collection<string, MusicPlayer> = new Collection();

    static async enqueue(interaction: RepliableInteraction): Promise<InteractionResponse> {
        const response = interaction.deferReply();
        let guildId: string | undefined = interaction.guild?.id;
        if (guildId === undefined) {
            guildId = "";
        }
        const textChannel = interaction.channel;
        const guildMember = (interaction.member instanceof GuildMember) ? interaction.member : undefined;
        const voiceChannel = guildMember?.voice.channel;
        const requester = guildMember?.user;
        let player = this.players.get(guildId);
        if (!voiceChannel) {
            interaction.reply("You are not in a room!");
            return response;
        }
        const botClientUserId = interaction.client.user?.id;
        if (botClientUserId === undefined) {
            interaction.reply("Internal Error");
            return response;
        }
        const permissions = voiceChannel.permissionsFor(botClientUserId);
        if (!permissions?.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
            interaction.reply("No permission!");
        }

        if (!player) {
            player = new MusicPlayer(
                textChannel,
                voiceChannel
            );
            // serverPlayer.on('leave', () => { serverMap.delete(guildId) })
            this.players.set(guildId, player);
        }
        // interaction.editReply("enqueued");
        return response;
    }

    static async join(interaction: RepliableInteraction): Promise<InteractionResponse> {
        let guildId: string | undefined = interaction.guild?.id;
        if (guildId === undefined) {
            guildId = "";
        }
        const textChannel = interaction.channel;
        const guildMember = (interaction.member instanceof GuildMember) ? interaction.member : undefined;
        const voiceChannel = guildMember?.voice.channel;
        let player = this.players.get(guildId);
        if (!player) {
            player = new MusicPlayer(
                textChannel,
                voiceChannel
            );
            // serverPlayer.on('leave', () => { serverMap.delete(guildId) })
            this.players.set(guildId, player);
        } else {
            return interaction.reply("I'm already in the room!");
        }

        return interaction.reply("joined");
    }
}