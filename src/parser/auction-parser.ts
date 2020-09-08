import request from 'request-promise';
import cheerio from 'cheerio';

export default class AuctionParser {
    private static instance: AuctionParser;
    constructor() {

    }

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    async getAwards(keyword: string) {
        try {
            const response = await request.get('http://browse.auction.co.kr/search?keyword='+encodeURI(keyword)+'&s=8');
            return this.handleAwardsData(response);
        } catch (err) {
            console.log('NaverRelKeywordParser ' + err);
        }
    }

    private handleAwardsData(html: string) {
        const $: any = cheerio.load(html);

        let result: any = {
            data: [{}, {}, {}, {}, {}]
        };
        for (var j = 0; j < 5; j++) {
            result.data[j].reviewcnt = 0;
            result.data[j].buycnt = 0;
        }

        $('.item.reviewcnt').each((i: number, elem: any) => {
            if (i < 5) {
                const resultData = $(elem).children().text();
                result.data[i].reviewcnt = Number(resultData.replace(/[^0-9]/g,""));
            } else {
                return;
            }
            i += 1;
        });
        $('.item.buycnt').each((i: number, elem: any) => {
            if (i < 5) {
                const resultData = $(elem).children().text();
                result.data[i].buycnt = Number(resultData.replace(/[^0-9]/g,""));
            } else {
                return;
            }
            i += 1;
        });
        $('.text--itemcard_title.ellipsis').each((i: number, elem: any) => {
            if (i < 5) {
                const href = $(elem).children().attr('href');
                result.data[i].href = href;
                const resultData = $(elem).children().text();
                result.data[i].title = resultData.split('상품명')[1];
            } else {
                return;
            }
            i += 1;
        });
        return result.data;
    }
}