import { ParserParam } from '../models/parser-param';
import { RankResult } from '../models/rank-result';

import request from 'request-promise';

export default class NaverPostParser {
    private static instance: NaverPostParser;

    private parserParam!: ParserParam;
    private rankResult!: RankResult;

    constructor() {

    }

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    set param(parserParam: ParserParam) {
        this.parserParam = parserParam;
    }

    async getTotalPost(keyword: string) {
        let blog = (await this.handlePostData('blog', keyword)).total;
        let cafe = (await this.handlePostData('cafearticle', keyword)).total;
        // news
        return blog + cafe;
    }

    async getPost(type: string, keyword: string) {
        let postData = await this.handlePostData(type, keyword);
        return postData.items;
    }

    async handlePostData(type: string, keyword: string) {
        try {
            this.rankResult = {
                data: []
            };
            var options = {
                url: this.parserParam.url + type + '?query=' + encodeURI(keyword),
                headers: this.parserParam.headers
            };
            const response = await request.get(options);
            const json_obj = await JSON.parse(response);
            return json_obj;
        } catch (err) {
            console.log('NaverPostParser ' + err);
        }
    }

}