import request from 'request-promise';
import cheerio from 'cheerio';

export default class NaverRelKeywordParser {
    private static instance: NaverRelKeywordParser;
    constructor() {

    }

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    async getRelKeyword(keyword: string) {
        try {
            const response = await request.get('https://search.naver.com/search.naver?sm=top_hty&fbm=1&ie=utf8&query=' + encodeURI(keyword));
            return (await this.handleRelKeywordData(response)).keyword;
        } catch (err) {
            console.log('NaverRelKeywordParser getRelKeyword' + err);
        }
    }

    private async handleRelKeywordData(html: string) {

        const $: any = cheerio.load(html);
        let response: any = {
            keyword: []
        };
    
        await $('._related_keyword_ul').find('li').each(async (i: number, elem: any) => {
            const resultData = await $(elem).children().text();
            response.keyword.push(resultData);
        });
        return response;
    }
}