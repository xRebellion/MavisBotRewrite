import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionDisconnectReason, VoiceConnectionStatus } from "@discordjs/voice";
import { TextBasedChannel, VoiceBasedChannel } from "discord.js";
import { delay } from "../../util/delay";
import { MusicQueue } from "./MusicQueue";

export class MusicPlayer {
    textChannel: TextBasedChannel | null; // temporary undefined
    voiceChannel: VoiceBasedChannel | null | undefined;
    voiceConnection: VoiceConnection;
    audioPlayer: AudioPlayer;
    queue: MusicQueue;

    private timeout?: NodeJS.Timeout;
    private resource: AudioResource | null;
    private nextResource: AudioResource | null;
    private readyLock: boolean;
    private queueLock: boolean;

    constructor(textChannel: TextBasedChannel | null, voiceChannel: VoiceBasedChannel | null | undefined) {
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        if (!textChannel || !voiceChannel) {
            throw new TypeError("Text or Voice Channels cannot be null or undefined.");
        } else {
            this.voiceConnection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
        }
        this.audioPlayer = createAudioPlayer();
        this.queue = new MusicQueue();
        this.timeout = undefined;
        this.resource = null;
        this.nextResource = null;
        this.readyLock = false;
        this.queueLock = false;


        // Configure audio player
        this.audioPlayer.on('stateChange', (oldState, newState) => {
            if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                // If the Idle state is entered from a non-Idle state, it means that an audio resource has finished playing.
                // The queue is then processed to start playing the next track, if one is available.

                this.timeout = setTimeout(() => {
                    console.log("I still wanted to leave anyway");
                    // this.leave()
                }, 15 * 60 * 1000);
                this.resource = null;
                void this.processQueue();

            } else if (newState.status === AudioPlayerStatus.Playing) {
                // If the Playing state has been entered, then a new track has started playback.
                clearTimeout(this.timeout);
                // this.playerEmbed.resend()
            }
        });
        this.audioPlayer.on('error', error => {
            console.error(`Error: ${error.message} with resource ${error.resource.metadata}`);
        });

        this.voiceConnection.on('stateChange', async (_, newState) => {
            if (newState.status === VoiceConnectionStatus.Disconnected) {
                if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
                    /*
                        If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
                        but there is a chance the connection will recover itself if the reason of the disconnect was due to
                        switching voice channels. This is also the same code for the bot being kicked from the voice channel,
                        so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
                        the voice connection.
                    */

                    try {
                        await entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
                        // Probably moved voice channel
                    } catch {
                        this.voiceConnection.destroy();
                        // Probably removed from voice channel
                    }
                } else if (this.voiceConnection.rejoinAttempts < 5) {
                    /*
                        The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
                    */
                    await delay((this.voiceConnection.rejoinAttempts + 1) * 5_000);
                    this.voiceConnection.rejoin();
                } else {
                    /*
                        The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
                    */
                    this.voiceConnection.destroy();
                }
            } else if (newState.status === VoiceConnectionStatus.Destroyed) {
                /*
                    Once destroyed, stop the subscription
                */
                this.clear();
                // this.playerEmbed.destroy()
                // this.emit('leave')
            } else if (
                !this.readyLock &&
                (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)
            ) {
                /*
                    In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
                    before destroying the voice connection. This stops the voice connection permanently existing in one of these
                    states.
                */
                this.readyLock = true;
                try {
                    await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 20_000);
                } catch {
                    if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) {
                        this.voiceConnection.destroy();
                    }
                } finally {
                    this.readyLock = false;
                }
            }
        });

        this.voiceConnection.subscribe(this.audioPlayer);

    }

    async processQueue(): Promise<void> {
        try {
            // If the queue is locked (already being processed), is empty, or the audio player already cached the next song
            if (this.queueLock || (this.audioPlayer.state.status != AudioPlayerStatus.Idle && this.nextResource)) {
                return;
            }

            if (this.queue.isEmpty()) {
                if (this.audioPlayer.state.status != AudioPlayerStatus.Idle) return;
                else {
                    console.log("Supposedly done");
                    console.log(this.queue);
                    this.queue.empty();
                    // this.playerEmbed.stopProgressBar();
                    // this.playerEmbed.setSong(null);
                    // this.playerEmbed.resend();
                    return;
                }
            }

            if (this.audioPlayer.state.status != AudioPlayerStatus.Idle && !this.nextResource) {
                this.cacheNextSong();
                return;
            }

            // Lock the queue to guarantee safe access
            this.queueLock = true;

            // Take the first item from the queue
            const track = this.queue.shift();
            // this.playerEmbed.setSong(track);

            // Attempt to convert the Track into an AudioResource (i.e. start streaming the video)
            if (!this.resource && !this.nextResource) { // Queuing a playlist
                this.resource = await track.createAudioResource();
                this.cacheNextSong();
            } else if (!this.nextResource) { // first time requesting a song
                this.resource = await track.createAudioResource();
            } else { // on consequent (2+) requests.
                this.resource = this.nextResource;
                this.cacheNextSong();
            }

            // this.playerEmbed.setAudioResource(this.resource);
            // this.playerEmbed.startProgressBar();
            if (this.resource !== null) {
                this.audioPlayer.play(this.resource);
            } else {
                console.debug("Resource is empty");
            }
            // console.log("Current: ", this.resource)

            this.queueLock = false;
        } catch (error) {
            console.error("Error when trying to play / convert resource");
            console.error("Current: ", this.resource);
            console.error("Next: ", this.nextResource);
            console.error(error);
        }
        return this.processQueue();

    }
}