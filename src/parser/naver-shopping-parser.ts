import { ParserParam } from '../models/parser-param';

import request from 'request-promise';

export default class NaverShoppingParser {
    private static instance: NaverShoppingParser;

    private parserParam!: ParserParam;

    constructor() {

    }

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    set param(parserParam: ParserParam) {
        this.parserParam = parserParam;
    }

    async getCategory(keyword: string) {
        try {
            let postData = await this.handlePostData(keyword);
            return postData.items[0].category1;
        } catch (err) {
            console.log('NaverShoppingParser getCategory' + err);
        }
    }

    async handlePostData(keyword: string) {
        try {
            var options = {
                url: this.parserParam.url + 'shop?query=' + encodeURI(keyword) + '&display=1&start=1&sort=sim',
                headers: this.parserParam.headers
            };
            const response = await request.get(options);
            const json_obj = await JSON.parse(response);
            return json_obj;
        } catch (err) {
            console.log('NaverShoppingParser ' + err);
        }
    }

}