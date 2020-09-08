import { ParserParam } from '../models/parser-param';
import { RankResult } from '../models/rank-result';
import { Rank } from '../models/rank';
import daumPostParser from './daum-post-parser';
import daumPostParam from '../models/params/daum-post-param';

import request from 'request-promise';
import cheerio from 'cheerio';

export default class DaumParser {
    private static instance: DaumParser;

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

    async getRank() {
        try {
            const response = await request.get(this.parserParam.url);
            return (await this.handleRankData(response)).data;
        } catch (err) {
            console.log('DaumParser getRank' + err);
        }
    }


    numberWithCommas(x: any) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    private async handleRankData(html: string) {
        const sleep = (ms: any) => {
            return new Promise(resolve => {
                setTimeout(resolve, ms)
            })
        }

        const daum_post_parser = daumPostParser.Instance;
        daum_post_parser.param = daumPostParam;

        const $: any = cheerio.load(html);

        this.rankResult = {
          data: []
        };
    
        await $(this.parserParam.querySelector).find('li').each(async (i: number, elem: any) => {
            const resultData = await this.parserParam.parserSelector($, elem);
            if (i < 10) { // 10개만 파싱
                let post = await daum_post_parser.getAllPost(resultData.title);
                await sleep(20);
                const rankData: Rank = {
                    rank: i + 1,
                    title: resultData.title,
                    post: this.numberWithCommas(post)
                };
                this.rankResult.data.push(rankData);
                if (this.rankResult.data.length == 10) { // 비동기 방식이라서 내용이 전부 들어갔을 때 오름차순 정렬
                    this.rankResult.data.sort(function (itemA: any, itemB: any) {
                        let dataA = itemA.rank;
                        let dataB = itemB.rank;
                        return dataA > dataB ? 1 : -1;
                    });
                }
            }
        });
        return this.rankResult;
    }
}