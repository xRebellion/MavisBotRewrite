import { Song } from "./Song";

export class MusicQueue {
    songs: Song[];
    nowPlaying?: Song;
    songMap: Map<string, Song>;

    constructor() {
        this.songs = []; // IDs only
        this.nowPlaying = undefined; // ID only
        this.songMap = new Map();
    }

    // addSong(song) {
    //     this.songs.push(song.videoId)
    //     this.songMap.set(song.videoId, song)
    // }

    // addSongToIndex(song, index) { // returns index of added song
    //     if (index < 0) {
    //         this.addSong(song)
    //         return this.songs.length - 1
    //     } else {
    //         this.songs.splice(index, 0, song.videoId)
    //         this.songMap.set(song.videoId, song)
    //         return index
    //     }
    // }

    // addSongsToIndex(songs, index) {
    //     let i = index
    //     for (const song of songs) {
    //         if (index < 0) {
    //             this.addSong(song)
    //         } else {
    //             this.addSongToIndex(song, i++)
    //         }
    //     }
    // }

    // getSong(index) {
    //     return this.songMap.get(this.songs[index])
    // }
    // getSongByVideoID(id) {
    //     return this.songMap.get(id)
    // }
    // getNextSong() {
    //     return this.getSong(0)
    // }
    // nextSongExists() {
    //     return this.songs[0] != undefined
    // }

    // getNowPlaying() {
    //     return this.songMap.get(this.nowPlaying)
    // }
    // shuffle() {
    //     let currentIndex = this.songs.length, randomIndex

    //     // While there remain elements to shuffle...
    //     while (currentIndex != 1) {

    //         // Pick a remaining element...
    //         randomIndex = Math.floor(Math.random() * currentIndex)
    //         currentIndex--

    //         // And swap it with the current element.
    //         [this.songs[currentIndex], this.songs[randomIndex]] = [
    //             this.songs[randomIndex], this.songs[currentIndex]]
    //     }
    // }

    // empty() {
    //     this.songs = []
    //     this.nowPlaying = null
    //     this.songMap.clear()
    // }

    // shift() {
    //     if (this.nowPlaying && !this.songs.includes(this.nowPlaying)) { // TODO: remember why this is here
    //         this.songMap.delete(this.nowPlaying)
    //     } // in case of dupes, don't delete map if there are
    //     this.nowPlaying = this.songs.shift()
    //     return this.getNowPlaying()
    // }

    // isEmpty() {
    //     return this.songs.length == 0
    // }

    // isPlaying() {
    //     return this.nowPlaying != null
    // }

    // move(from, to) {
    //     if (from >= this.songs.length || to >= this.songs.length)
    //         return
    //     this.songs.splice(to, 0, this.songs.splice(from, 1)[0])
    // }

    // remove(position) {
    //     const removed = this.songs.splice(position, 1)[0]
    //     if (!this.songs.includes(removed)) { // TODO: remember why this is here
    //         this.songMap.delete(removed)
    //     } // in case of dupes, don't delete map if there are
    //     return removed
    // }

    // async updateDurations() {
    //     let q = ""
    //     let i = 0 // 50 songs partition counter to query video duration in batches
    //     let j = 0 // Total songs counter
    //     let details = []
    //     const songs = this.songs.slice()
    //     for (const id of songs) {
    //         let videoId = id
    //         j++
    //         if (this.songMap.get(videoId).duration > 0) continue
    //         i++
    //         q = q + videoId + ","
    //         if (i == 50 || j == this.songs.length) {
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