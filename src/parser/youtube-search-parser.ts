import request from 'request-promise';

import { Item } from '../models/item';
import { ItemResult } from '../models/item-results';

export default class youtubeSearchParser {

    private url = 'https://www.googleapis.com/youtube/v3/';    
    private videoDetails = 'part=snippet,contentDetails,statistics';
    private apiKey = 'AIzaSyBocWtdIuBkET9vngvaAuXetWDuZKHBqwk';
    //private apiKey = 'AIzaSyCuxSLoqvfVjvVHKAbXGCTDxJzithE0cxE';
    private static instance: youtubeSearchParser;
    private itemResult!: ItemResult;
    constructor() {

    }

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    //https://developers.google.com/youtube/v3/docs/search/list 참고

    async searchVideo(keyword: string) {
        //return null; // 유튜브 크롤링 잠금
        try {
            const response = await request.get(this.url + 'search?part=snippet&q=' + encodeURI(keyword) + '&maxResults=3&type=video&regionCode=KR&key=' + this.apiKey);
            return await this.handleVideoData(response);
        } catch (err) {
            //console.log(err);
        }
    }

    private async handleVideoData(html: string) {
        let json_obj = JSON.parse(html);
        let items = json_obj.items;
        this.itemResult = {
            totalResults: json_obj.pageInfo.totalResults,
            items: []
        };

        for (var i = 0; i < items.length; i++) {
            let item = items[i];
            let videoId = item.id.videoId;
            let videoInfo = (await this.getVideoInfo(videoId)).items[0];
            let stats = videoInfo.statistics;
            const itemData: Item = {
                channelTitle: videoInfo.snippet.channelTitle,
                channelId: videoInfo.snippet.channelId,
                thumbnails: videoInfo.snippet.thumbnails.medium.url,
                title: item.snippet.title,
                videoId,
                viewCount: stats.viewCount,
                likeCount: stats.likeCount,
                dislikeCount: stats.dislikeCount,
                favoriteCount: stats.favoriteCount,
                commentCount: stats.commentCount
            };
            this.itemResult.items.push(itemData);
        }
        return this.itemResult;
    }

    async getVideoInfo(id: string) {
        try {
            const response = await request.get(this.url+'videos?'+this.videoDetails+'&id='+id+'&key='+this.apiKey);
            return JSON.parse(response);
        } catch (err) {
            //console.log(err);
        }
    }

}