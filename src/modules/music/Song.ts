import ytdl from "ytdl-core";

export class Song {
    videoId: string;
    title: string;
    thumbnail: ytdl.thumbnail;
    duration: number;
    channelName: string;
    constructor(videoId: string, title: string, thumbnail: ytdl.thumbnail, duration: number, channelName: string) {
        this.videoId = videoId;
        this.title = title;
        this.thumbnail = thumbnail;
        this.duration = duration;
        this.channelName = channelName;
    }
}