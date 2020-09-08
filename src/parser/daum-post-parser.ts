import { ParserParam } from '../models/parser-param';

import request from 'request-promise';

export default class DaumPostParser {
    private static instance: DaumPostParser;

    private parserParam!: ParserParam;

    constructor() {

    }

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    set param(parserParam: ParserParam) {
        this.parserParam = parserParam;
    }

    async getAllPost(keyword: string) {

        const responses = await Promise.all([
            this.getPost('blog', keyword),
            this.getPost('cafe', keyword)
        ]);
        let blog = responses[0];
        let cafe = responses[1];
        return blog + cafe;
    }

    async getPost(type: string, keyword: string) {
        try {
            var options = {
                url: this.parserParam.url + type + '?query=' + encodeURI(keyword),
                headers: this.parserParam.headers
            };
            const response = await request.get(options);
            const json_obj = await JSON.parse(response);
            return json_obj.meta.total_count;
        } catch (err) {
            console.log('DaumPostParser ' + err);
        }
    }

}