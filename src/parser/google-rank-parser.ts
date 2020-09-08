import { ParserParam } from '../models/parser-param';
import { RankResult } from '../models/rank-result';
import { Rank } from '../models/rank';

import request from 'request-promise';
import cheerio from 'cheerio';

export default class GoogleParser {
    private static instance: GoogleParser;

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
            return this.handleRankData(response).data;
        } catch (err) {
            console.log('GoogleParser ' + err);
        }
    }

    private handleRankData(html: string) {
        const $: any = cheerio.load(html);

        this.rankResult = {
          data: []
        };
    
        $(this.parserParam.querySelector).each((i: number, elem: any) => {
            const resultData = this.parserParam.parserSelector($, elem);
            const rankData: Rank = {
              rank: i + 1,
              title: resultData.title,
              search: resultData.traffic
            };
            if (i < 10) 
                this.rankResult.data.push(rankData);
          });
          return this.rankResult;
    }
}