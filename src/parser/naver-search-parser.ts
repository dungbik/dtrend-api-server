import { ParserParam } from '../models/parser-param';
import { RankResult } from '../models/rank-result';

import request from 'request-promise';
import crypto from 'crypto';

export default class NaverSearchParser {
    private static instance: NaverSearchParser;

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

    async getSearchData(keyword: string, size: Number, sort: Boolean) {
        try {
            return (await this.getSearch(keyword, size, sort)).data;
        } catch (err) {
            console.log('NaverSearchParser:getSearchData ' + err);
        }
    }


    async getSearch(keyword: string, size: Number, sort: Boolean) {
        try {
            let timestamp = Date.now();
            let message = timestamp + "." + this.parserParam.method + "." + this.parserParam.type;
            let hmac = crypto.createHmac('sha256', this.parserParam.secretKey);
            let nb = Buffer.alloc(message.length, message, 'utf-8');
            hmac.update(nb);
            let sig = hmac.digest('base64');
            var headers = this.parserParam.headers;
            headers['X-Timestamp'] = timestamp;
            headers['X-Signature'] = sig;

            var options = {
                url: this.parserParam.url + this.parserParam.type,
                qs: {
                    "hintKeywords": keyword.split(' ').join(''), // 빈칸이 있으면 작동이 안됨,
                    "includeHintKeywords": "1",
                    "showDetail": "1"
                },
                headers: headers
            };
            const response = await request.get(options);
            return this.handleSearchData(response, size, sort);
        } catch (err) {
            console.log('NaverSearchParser:getSearch ' + err);
        }
    }

    private getCount(json: any) {
        let pc_cnt = Number(json.monthlyPcQcCnt);
        if (Number.isNaN(pc_cnt)) {
            pc_cnt = 0;
        }
        let mobile_cnt = Number(json.monthlyMobileQcCnt);
        if (Number.isNaN(mobile_cnt)) {
            mobile_cnt = 0;
        }
        return pc_cnt + mobile_cnt;
    }

    numberWithCommas(x: any) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    
    private handleSearchData(html: string, size: Number, sort: Boolean) {
        try {
            let response: any = {
                data: []
            }; 
            let json_obj = JSON.parse(html).keywordList;
            if (sort && size > 1) {
                let self = this;
                json_obj = json_obj.slice(0);
                json_obj.sort(function (itemA: any, itemB: any) {
                    var dataA = self.getCount(itemA);
                    var dataB = self.getCount(itemB);
                    if (dataA == dataB) {
                        return 0;
                    }
                    return dataA < dataB ? 1 : -1;
                });
            }

            if (size > json_obj.length) { // 크롤링한 데이터가 원하는 데이터 수보다 적을때
                size = json_obj.length;
            }

            for (var i = 0; i < size; i++) {
                let cur_obj = json_obj[i];
                let data = {
                    title: cur_obj.relKeyword,
                    qc_pc: this.numberWithCommas(cur_obj.monthlyPcQcCnt),
                    qc_mobile: this.numberWithCommas(cur_obj.monthlyMobileQcCnt),
                    ave_pc:  cur_obj.monthlyAvePcCtr,
                    ave_mobile: cur_obj.monthlyAvePcCtr
                };
                response.data.push(data);
            }
            return response;
        } catch (err) {
            console.log('NaverSearchParser:handleSearchData ' + err);
        }
        //return this.rankResult;
    }

}