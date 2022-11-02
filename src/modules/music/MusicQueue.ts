import { Song } from "./Song";

export class MusicQueue {
    songIds: string[];
    nowPlaying?: string;
    songMap: Map<string, Song>;

    constructor() {
        this.songIds = []; // IDs only
        this.nowPlaying = undefined; // ID only
        this.songMap = new Map();
    }

    addSong(song: Song) {
        this.songIds.push(song.videoId);
        this.songMap.set(song.videoId, song);
    }

    addSongToIndex(song: Song, index: number): number { // returns index of added song
        if (index < 0) {
            this.addSong(song);
            return this.songIds.length - 1;
        } else {
            this.songIds.splice(index, 0, song.videoId);
            this.songMap.set(song.videoId, song);
            return index;
        }
    }

    addsongIdsToIndex(songIds: Song[], index: number): void {
        let i = index;
        for (const song of songIds) {
            if (index < 0) {
                this.addSong(song);
            } else {
                this.addSongToIndex(song, i++);
            }
        }
    }

    getSong(index: number): Song | undefined {
        return this.songMap.get(this.songIds[index]);
    }
    getSongByVideoID(id: string): Song | undefined {
        return this.songMap.get(id);
    }
    getNextSong(): Song | undefined {
        return this.getSong(0);
    }
    nextSongExists(): boolean {
        return this.songIds[0] != undefined;
    }

    getNowPlaying(): Song | undefined {
        if (this.nowPlaying) return this.songMap.get(this.nowPlaying);
        else return undefined;
    }
    shuffle(): void {
        let currentIndex = this.songIds.length, randomIndex;

        // While there remain elements to shuffle...
        while (currentIndex != 1) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [this.songIds[currentIndex], this.songIds[randomIndex]] = [
                this.songIds[randomIndex], this.songIds[currentIndex]];
        }
    }

    empty(): void {
        this.songIds = [];
        this.nowPlaying = undefined;
        this.songMap.clear();
    }

    shift(): Song | undefined {
        if (this.nowPlaying && !this.songIds.includes(this.nowPlaying)) { // TODO: remember why this is here
            this.songMap.delete(this.nowPlaying);
        } // in case of dupes, don't delete map if there are
        this.nowPlaying = this.songIds.shift();
        return this.getNowPlaying();
    }

    isEmpty(): boolean {
        return this.songIds.length == 0;
    }

    isPlaying(): boolean {
        return this.nowPlaying != null;
    }

    move(from: number, to: number): void {
        if (from >= this.songIds.length || to >= this.songIds.length)
            return;
        this.songIds.splice(to, 0, this.songIds.splice(from, 1)[0]);
    }

    remove(position: number): string {
        const removed = this.songIds.splice(position, 1)[0];
        if (!this.songIds.includes(removed)) {
            this.songMap.delete(removed);
        } // in case of dupes, don't delete map if there are
        return removed;
    }

    // async updateDurations() {
    //     let q = "";
    //     let i = 0; // 50 songIds partition counter to query video duration in batches
    //     let j = 0; // Total songIds counter
    //     let details = []
    //     const songIds = this.songIds.slice()
    //     for (const id of songIds) {
    //         let videoId = id
    //         j++
    //         if (this.songMap.get(videoId).duration > 0) continue
    //         i++
    //         q = q + videoId + ","
    //         if (i == 50 || j == this.songIds.length) {
    //             let response = null
    //             q = q.slice(0, -1)
    //             const params = {
    //                 part: "contentDetails",
    //                 id: q,
    //                 key: process.env.YOUTUBE_API_KEY
    //             }
    //             try {
    //                 response = await axios.get(YOUTUBE_VIDEOS_API_URL, {
    //                     params: params
    //                 })
    //             } catch (err) {
    //                 return console.error(err)
    //             }

    //             details = details.concat(response.data.items)
    //             q = ""
    //             i = 0

    //         }

    //     }
    //     for (let i = 0; i < details.length; i++) {
    //         const song = this.songMap.get(details[i].id)
    //         song.duration = helper.ptToSeconds(details[i].contentDetails.duration)
    //         this.songMap.set(song)
    //     }
    // }

}