import { ParserParam } from '../models/parser-param';

import request from 'request-promise';
import xml2js from 'xml2js';

export default class TestParser {
    private static instance: TestParser;

    private parserParam!: ParserParam;

    constructor() {

    }

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    set param(parserParam: ParserParam) {
        this.parserParam = parserParam;
    }

    xmlToJson(xmlStr: string) {
        let result: any;
        xml2js.parseString(xmlStr, (err: any, r: any) => {result = r});
        return result;
    }

    async getPost(keyword: string) {
        try {
            //return null;
            let data = await this.handleData(keyword);

            let result:any = {}
            result.items = data.response.body[0].items[0].item;
            result.count = data.response.count[0].totalCount[0];
            return result;
        } catch (err) {
            console.log('TestParser getPost ' + err);
        }
    }

    async handleData(keyword: string) {
        try {
            var url = 'http://kipo-api.kipi.or.kr/openapi/service/patUtiModInfoSearchSevice/getWordSearch';
            var queryParams = '?' + encodeURIComponent('ServiceKey') + '=GUsJpd0zBJDYuuvE%2F%2F1za43xxqq9pg2xiVwp7u8eQg33oma0JhO7Nlp3D30MDeEs87PonybfEzeB6DbcjET6VA%3D%3D'; /* Service Key*/
            queryParams += '&' + encodeURIComponent('word') + '=' + encodeURIComponent(keyword); /* */
            queryParams += '&' + encodeURIComponent('year') + '=' + encodeURIComponent('0'); /* */
            queryParams += '&' + encodeURIComponent('patent') + '=' + encodeURIComponent('true'); /* */
            queryParams += '&' + encodeURIComponent('utility') + '=' + encodeURIComponent('false'); /* */

            var options = {
                url: url + queryParams
            };
            const response = await request.get(options);
            let json_obj = this.xmlToJson(response);
            return json_obj;
        } catch (err) {
            console.log('TestParser ' + err);
        }
    }

}