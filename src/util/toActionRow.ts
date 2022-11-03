import { ActionRowBuilder, SelectMenuBuilder } from "discord.js";
import { Song } from "../modules/music/Song";

export function toActionRow(videos: (Song | undefined)[]) {
    const selectMenu = new SelectMenuBuilder()
        .setCustomId("select")
        .setPlaceholder("Please select a song");
    for (const video of videos) {
        if (!video) continue;
        selectMenu.addOptions({
            label: video.title,
            description: video.channelName,
            value: video.videoId,
        });
    }
    return new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu);
}