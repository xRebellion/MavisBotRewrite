import { getInfo } from "ytdl-core";
import { Song } from "./Song";

export class YoutubeClient {
    static async getSongInfo(url: URL): Promise<Song> {
        const videoId = url.searchParams.get('v');
        if (videoId === null) {
            return new Promise((_, reject) => {
                reject("Video ID cannot be empty");
            });
        }
        const info = await getInfo(videoId);
        return new Promise((resolve) => {
            resolve(new Song(
                videoId,
                info.videoDetails.title,
                info.videoDetails.thumbnails.slice(-1)[0],
                parseInt(info.videoDetails.lengthSeconds),
                info.videoDetails.ownerChannelName,
                ""
            ));
        });
    }


}