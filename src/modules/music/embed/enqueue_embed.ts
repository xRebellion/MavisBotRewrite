import { EmbedBuilder, User } from "discord.js";
import ytdl from "ytdl-core";
import { Song } from "../Song";
export class EnqueueEmbed {
    user: User;
    title: string;
    thumbnail: ytdl.thumbnail;
    channelName: string;
    videoURL: string;
    position: number;
    constructor(song: Song, position: number) {
        this.user = song.requester;
        this.title = song.title;
        this.thumbnail = song.thumbnail;
        this.channelName = song.channelName;
        this.videoURL = song.getVideoURL();
        this.position = position;
    }

    build() {
        return new EmbedBuilder()
            .setColor(0x027059)
            .setTitle(this.title)
            .setURL(this.videoURL)
            .setAuthor({
                name: "Added to queue",
                iconURL: this.user.displayAvatarURL()
            })
            .setThumbnail(this.thumbnail.url)
            .addFields(
                { name: "Channel", value: this.channelName, inline: true },
                { name: "Position", value: String(this.position), inline: true },
                { name: "Requested by", value: "<@" + this.user.id + ">" }
            );
    }


}
