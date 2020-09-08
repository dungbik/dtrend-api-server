import { ParserParam } from '../models/parser-param';
import naverShoppingParser from '../parser/naver-shopping-parser';
import naverShoppingParam from '../models/params/naver-post-param';

import request from 'request-promise';

const naver_shopping_parser = naverShoppingParser.Instance;

export default class NaverDatalab2Parser {
    private static instance: NaverDatalab2Parser;

    private parserParam!: ParserParam;

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

    async getCategory(keyword: string) {
        let category_list:any = {
            '패션의류': '50000000',
            '패션잡화': '50000001',
            '화장품/미용': '50000002',
            '디지털/가전': '50000003',
            '가구/인테리어': '50000004',
            '출산/육아': '50000005',
            '식품': '50000006',
            '스포츠/레저': '50000007',
            '생활/건강': '50000008',
            '여가/생활편의': '50000009',
            '면세점': '50000010'
        };
        naver_shopping_parser.param = naverShoppingParam;
        let category_name = await naver_shopping_parser.getCategory(keyword);
        return [category_name, category_list[category_name]];
    }

    async getYearKeywordTrend(keyword: string) {
        try {
            let now = new Date();
            now.setMonth(now.getMonth()-1);
            let endDate = this.getDate(now);
            let startDate = now.getFullYear() + '-01-01';
            let category = await this.getCategory(keyword);
            let request_body = {
                "startDate": startDate,
                "endDate": endDate,
                "timeUnit": "month",
                "category": category[1],
                "keyword": [
                    {
                        "name": category[0],
                        "param": [
                            keyword
                        ]
                    }
                ]
            };
            const json_obj = await this.getKeywordTrend(keyword, request_body);
            return json_obj.results[0].data;
        } catch (err) {
            console.log('NaverDatalab2Parser getYearKeywordTrend' + err);
        }
    }

    async getMonthKeywordTrend(keyword: string) {
        try {
            let now = new Date();
            let endDate = this.getDate(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)); // 1일전
            let startDate = this.getDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)); // 31일전
            let category = await this.getCategory(keyword);

            let request_body = {
                "startDate": startDate,
                "endDate": endDate,
                "timeUnit": "date",
                "category": category[1],
                "keyword": [
                    {
                        "name": category[0],
                        "param": [
                            keyword
                        ]
                    }
                ]
            };
            const json_obj = await this.getKeywordTrend(keyword, request_body);
            return json_obj.results[0].data;
        } catch (err) {
            console.log('NaverDatalab2Parser getMonthKeywordTrend' + err);
        }
    }

    async getKeywordTrend(keyword: string, request_body: any) {
        try {
            var options = {
                url: this.parserParam.url + '/shopping/category/keywords',
                body: JSON.stringify(request_body),
                method: 'POST',
                headers: this.parserParam.headers
            };
            const response = await request.post(options);
            const json_obj = await JSON.parse(response);
            return json_obj;
        } catch (err) {
            console.log('NaverDatalab2Parser ' + err);
        }
    }

}