import { ParserParam } from '../models/parser-param';
import { RankResult } from '../models/rank-result';
import { Rank } from '../models/rank';
import naverPostParser from './naver-post-parser';
import naverPostParam from '../models/params/naver-post-param';
import naverSearchParser from './naver-search-parser';
import naverSearchParam from '../models/params/naver-search-param';

import request from 'request-promise';

export default class NaverParser {
    private static instance: NaverParser;

    private parserParam!: ParserParam;
    private rankResult!: RankResult;
    private naver_post_parser = naverPostParser.Instance;
    private naver_search_parser = naverSearchParser.Instance;

    constructor() {
        this.naver_post_parser.param = naverPostParam;
        this.naver_search_parser.param = naverSearchParam;
    }

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    set param(parserParam: ParserParam) {
        this.parserParam = parserParam;
    }

    async getRank() {
        try {
            const response = await request.get(this.parserParam.url);
            return (await this.handleRankData(response)).data;
        } catch (err) {
            console.log('NaverParser getRank' + err);
        }
    }

    private getCount(pc: any, mobile: any) {
        let total = 0;
        let pc_cnt = Number(pc.replace(',', ''));
        if (pc_cnt > 0) {
            total += pc_cnt;
        }
        let mobile_cnt = Number(mobile.replace(',', ''));
        if (mobile_cnt > 0) {
            total += mobile_cnt;
        }
        return total;
    }

    numberWithCommas(x: any) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    

    private async addData(i: number, json_obj: any) {
        try {
            const sleep = (ms: any) => {
                return new Promise(resolve=> {
                    setTimeout(resolve, ms)
                })
            }

            //let search_res = await this.naver_search_parser.getSearch(json_obj[i].keyword, 1, false);
            //let search = this.getCount(search_res.data[0].qc_pc, search_res.data[0].qc_mobile);
            let post = await this.naver_post_parser.getTotalPost(json_obj[i].keyword);
            const rankData: Rank = {
                rank: i + 1,
                title: json_obj[i].keyword,
                //search: this.numberWithCommas(/*search*/9999),
                post: this.numberWithCommas(post)
            };
            this.rankResult.data.push(rankData);
            if (this.rankResult.data.length == 10) {
                this.rankResult.data.sort(function (itemA: any, itemB: any) {
                    let dataA = itemA.rank;
                    let dataB = itemB.rank;
                    return dataA > dataB ? 1 : -1;
                });
            }
        } catch (err) {
            console.log('NaverParser addData ' + err);
        }
    }

    private async handleRankData(html: string) {
        const sleep = (ms: any) => {
            return new Promise(resolve=> {
                setTimeout(resolve, ms)
            })
        }

        this.rankResult = {
          data: []
        };

        this.rankResult.data = [];
    
        var json_obj = JSON.parse(html).data;

        let limit = json_obj.length; 
        if (limit > 10) {
            limit = 10;
        }

        for (var i = 0; i < limit; i++) { // 처리속도가 빠르면 응답 거절당함
            await this.addData(i, json_obj);
            await sleep(50);
        }
        return this.rankResult;
    }
}