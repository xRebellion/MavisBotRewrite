class Song {
    videoID: string;
    title: string;
    duration: number;
    channelName: string;
    constructor(videoID: string, title: string, duration: number, channelName: string) {
        this.videoID = videoID;
        this.title = title;
        this.duration = duration;
        this.channelName = channelName;
    }
}