import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice";
import { User } from "discord.js";
import ytdl, { getInfo } from "ytdl-core";

export class Song {

    videoId: string;
    title: string;
    thumbnail: ytdl.thumbnail;
    duration: number;
    channelName: string;
    requester: User;
    constructor(videoId: string, title: string, thumbnail: ytdl.thumbnail, duration: number, channelName: string, requester: User) {
        this.videoId = videoId;
        this.title = title;
        this.thumbnail = thumbnail;
        this.duration = duration;
        this.channelName = channelName;
        this.requester = requester;
    }

    async createAudioResource(): Promise<AudioResource> {
        return new Promise((resolve, reject) => {
            const ytReadable = ytdl(
                this.videoId,
                {
                    highWaterMark: 1 << 25,
                    filter: 'audioonly',
                }
            );
            demuxProbe(ytReadable).then(probeInfo => {
                if (!probeInfo.stream) {
                    reject(new Error('Unable to stream/load video'));
                }
                resolve(createAudioResource(probeInfo.stream, { metadata: this, inputType: probeInfo.type }));
            });
            //'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio'


        });
    }

    getVideoURL(): string {
        return "https://www.youtube.com/watch?v=" + this.videoId;
    }

    static async From(videoId: string | null, requester: User): Promise<Song | undefined> {
        if (videoId == null) return undefined;
        const info = await getInfo(videoId);
        return new Song(
            videoId,
            info.videoDetails.title,
            info.videoDetails.thumbnails.slice(-1)[0],
            parseInt(info.videoDetails.lengthSeconds),
            info.videoDetails.ownerChannelName,
            requester
        );
    }
}