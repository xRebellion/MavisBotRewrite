import { AudioPlayer, createAudioPlayer, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { TextBasedChannel, VoiceBasedChannel } from "discord.js";
import { MusicQueue } from "./MusicQueue";

export class MusicPlayer {
    textChannel: TextBasedChannel | null; // temporary undefined
    voiceChannel: VoiceBasedChannel | null | undefined;
    voiceConnection: VoiceConnection | undefined;
    audioPlayer: AudioPlayer;
    queue: MusicQueue;
    constructor(textChannel: TextBasedChannel | null, voiceChannel: VoiceBasedChannel | null | undefined) {
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        if (!voiceChannel) {
            this.voiceConnection = undefined;
        } else {
            this.voiceConnection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
        }
        this.audioPlayer = createAudioPlayer();
        this.queue = new MusicQueue();
    }

}