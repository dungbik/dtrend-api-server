import { ParserParam } from '../models/parser-param';
import { RankResult } from '../models/rank-result';
import { Rank } from '../models/rank';

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

    getDate(date: Date) {
        let year = date.getFullYear();
        let month = new String(date.getMonth() + 1);
        let day = new String(date.getDate());
        if (month.length == 1) {
            month = '0' + month;
        }
        if (day.length == 1){
            day = '0' + day;
        }
        return year + '-' + month + '-' + day;
    }

    async getYearKeywordTrend(keyword: string) {
        let now = new Date();
        now.setMonth(now.getMonth()-1);
        let endDate = this.getDate(now);
        let startDate = now.getFullYear() + '-01-01';

        let request_body = {
            "startDate": startDate,
            "endDate": endDate,
            "timeUnit": "month",
            "keywordGroups": [
                {
                    "groupName": keyword,
                    "keywords": [
                        keyword
                    ]
                }
            ]
        };
        const json_obj = await this.getKeywordTrend(keyword, request_body);
        return json_obj.results[0].data;
    }

    async getMonthKeywordTrend(keyword: string) {
        let now = new Date();
        let endDate = this.getDate(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)); // 1일전
        let startDate = this.getDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)); // 31일전
    
        let request_body = {
            "startDate": startDate,
            "endDate": endDate,
            "timeUnit": "date",
            "keywordGroups": [
                {
                    "groupName": keyword,
                    "keywords": [
                        keyword
                    ]
                }
            ]
        };
        const json_obj = await this.getKeywordTrend(keyword, request_body);
        return json_obj.results[0].data;
    }

    async getKeywordTrend(keyword: string, request_body: any) {
        try {
            var options = {
                url: this.parserParam.url + '/search',
                body: JSON.stringify(request_body),
                method: 'POST',
                headers: this.parserParam.headers
            };
            const response = await request.post(options);
            const json_obj = await JSON.parse(response);
            return json_obj;
        } catch (err) {
            console.log('NaverPostParser ' + err);
        }
    }

}