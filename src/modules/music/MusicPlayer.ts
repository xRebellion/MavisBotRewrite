import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionDisconnectReason, VoiceConnectionStatus } from "@discordjs/voice";
import axios from "axios";
import { InteractionReplyOptions, TextBasedChannel, User, VoiceBasedChannel, WebhookEditMessageOptions } from "discord.js";
import { delay } from "../../util/delay";
import { toActionRow } from "../../util/toActionRow";
import { EnqueueEmbed } from "./embed/enqueue_embed";
import { MusicQueue } from "./MusicQueue";
import { Song } from "./Song";

const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_PLAYLIST_API_URL = "https://www.googleapis.com/youtube/v3/playlistItems";
const YOUTUBE_VIDEO_URL = "https://www.youtube.com/watch";
const YOUTUBE_PLAYLIST_URL = "https://www.youtube.com/playlist";
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

    async enqueue(query: string, author: User, queueNumber: number): Promise<string | WebhookEditMessageOptions> {
        let response = null;
        let reply: string | InteractionReplyOptions = "empty";

        if (query.startsWith(YOUTUBE_VIDEO_URL)) {
            const url: URL = new URL(query);
            const videoId: string | null = url.searchParams.get('v');
            const song = await Song.From(videoId, author);
            if (!song) return "Song not found"; // TODO: error handling
            const index = this.queue.addSongToIndex(song, queueNumber - 1);

            const enqueueEmbed = new EnqueueEmbed(song, index + 1);
            reply = { embeds: [enqueueEmbed.build()], components: [], content: null };

        } else if (query.startsWith(YOUTUBE_PLAYLIST_URL)) {
            const url = new URL(query);
            const playlistId = url.searchParams.get('list');
            const songs = [];

            const params = {
                part: "snippet",
                key: process.env.YOUTUBE_API_KEY,
                playlistId: playlistId,
                maxResults: 50,
                pageToken: null
            };

            do {
                try {
                    response = await axios.get(YOUTUBE_PLAYLIST_API_URL, {
                        params: params
                    });
                } catch (err) {
                    console.error(err);
                    return "An error occurred";
                }
                for (const item of response.data.items) {
                    const song = new Song(
                        item.snippet.resourceId.videoId,
                        item.snippet.title,
                        item.snippet.thumbnails.standard,
                        -1,
                        item.snippet.videoOwnerChannelTitle,
                        author
                    );

                    songs.push(song);
                }
                params.pageToken = response.data.nextPageToken;
            } while (response.data.nextPageToken);
            if (!this.queue.isPlaying()) {
                songs[0] = await Song.From(songs[0].videoId, author);
            }
            this.queue.addSongsToIndex(songs, queueNumber - 1);
            // this.queue.updateDurations()
            reply = `Queued **${songs.length}** songs!`;

        } else {
            const params = {
                part: "id,snippet",
                key: process.env.YOUTUBE_API_KEY,
                q: query,
                type: "video",
                maxResults: 5
            };

            try {
                response = await axios.get(YOUTUBE_API_URL, {
                    params: params
                });
            } catch (err) {
                console.error(err);
                return "Error while trying to search up the video";
            }

            const searchedVideos: (Song | undefined)[] = [];
            for (const i of response.data.items) {
                searchedVideos.push(new Song(i.id.videoId, i.snippet.title, i.snippet.thumbnails.default, 0, i.snippet.channelTitle, author));
            }
            const actionRow = toActionRow(searchedVideos);
            return { content: "Select a song!", components: [actionRow] };

        }
        if (queueNumber == 1) { // if play top, refresh the cache {
            this.cacheNextSong();
        }
        this.processQueue();
        return reply;
    }

    cacheNextSong() {
        if (this.queue.nextSongExists()) {
            this.queue.getNextSong()?.createAudioResource().then(resource => {
                this.nextResource = resource;
            });
        } else {
            this.nextResource = null; // and last song
        }
    }
    clear() {
        this.queue.empty();
        this.resource = null;
        this.nextResource = null;
        this.audioPlayer.stop(true);
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
            if (!track) return;

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