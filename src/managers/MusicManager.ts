import { Collection, CommandInteraction, ComponentType, GuildMember, InteractionResponse, PermissionsBitField } from "discord.js";
import { MusicPlayer } from "../modules/music/MusicPlayer";
import { BaseManager } from "../types/BaseClasses";
import { RepliableInteraction } from "../types/RepliableInteraction";

const YOUTUBE_VIDEO_URL = "https://www.youtube.com/watch?v=";
export class MusicManager extends BaseManager {
    static players: Collection<string, MusicPlayer> = new Collection();

    static async enqueue(interaction: CommandInteraction): Promise<InteractionResponse> {
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
            return interaction.reply("You are not in a room!");
        }
        const botClientUserId = interaction.client.user?.id;
        if (botClientUserId === undefined) {
            return interaction.reply("Internal Error");
        }
        const permissions = voiceChannel.permissionsFor(botClientUserId);
        if (!permissions?.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
            return interaction.reply("No permission!");
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
        const query = interaction.options.get("url-or-query")?.value?.toString();

        if (!query || !requester?.username) {
            return interaction.reply("An error occurred");
        } // TODO: handling error
        const enqueueResult = await player.enqueue(query, requester, 0);
        const response = interaction.reply(enqueueResult);
        if (typeof enqueueResult !== 'string') {
            const collector = textChannel?.createMessageComponentCollector({ componentType: ComponentType.SelectMenu, time: 30000 });
            collector?.on('collect', async i => {
                if (i.customId === "select" && i.user.id === interaction.user.id) {
                    if (!player) return;
                    const queryEnqueueResult = await player.enqueue(YOUTUBE_VIDEO_URL + i.values[0], requester, 0);
                    interaction.editReply(queryEnqueueResult);

                    collector.stop();
                }
            });
        }
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