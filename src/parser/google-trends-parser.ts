import { ParserParam } from '../models/parser-param';
import { RankResult } from '../models/rank-result';

import request from 'request-promise';

export default class GoogleTrendsParser {
    private static instance: GoogleTrendsParser;

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

    async getPost(keyword: string) {
        try {
            let result:any = {};
            const responses = await Promise.all([
                this.process(keyword, "KR"),
                this.process(keyword, "US"),
                this.process(keyword, "CN"),
                this.process(keyword, "JP"),
                this.process(keyword, "VN")
            ]);
            result.kr = responses[0];
            result.us = responses[1];
            result.cn = responses[2];
            result.jp = responses[3];
            result.vn = responses[4];

            return result;
        } catch(err) {
            console.log('GoogleTrendsParser getPost ' + err);
        }
    }

    async process(keyword:string, geo:string) {
        let postData = '';
        postData += await this.handlePostData(keyword, geo);
        let json_obj = JSON.parse(postData.slice(4)).widgets;
        let req = json_obj[0].request;
        const token = json_obj[0].token;
        req = JSON.stringify(req);
  
        const nextOptions = {
          url: 'https://trends.google.com/trends/api/widgetdata/multiline',
          method: 'GET',
          qs: {
            hl: 'ko', 
            req: req,
            token,
            tz: -540,
          },
        };
        const response = await request.get(nextOptions);
        return JSON.parse(response.slice(5));
    }

    async rehandlePostData(options: any, done: any) {
                request.get(options, (error: any, response: any) => {
                    if (error) {
                        console.log('GoogleTrendsParser ' + error);
                        done(error, '')
                    } else {
                        if (response.statusCode != 200) {
                            done('', '');
                        } else {
                            done('', response.body);
                        }
                    }
              });
    }

    async handlePostData(keyword: string, geo:string) {
        const options:any = {
            method: 'GET',
            url: 'https://trends.google.com/trends/api/explore',
            qs: {
                hl: 'ko',
                tz: -540,
                req: '{"comparisonItem":[{"keyword":"' + keyword + '","geo":' + geo + ',"time":"today 1-m"}],"category":0,"property":""}',
            },
            resolveWithFullResponse: true
        };
        let p = await new Promise((resolve, reject) => {
                request.get(options, (error: any, response: any) => {
                        if (response.statusCode === 429 && response.headers['set-cookie']) {
                            let cookieVal = response.headers['set-cookie'][0].split(';')[0];
                            options.headers = {'cookie': cookieVal};
                            this.rehandlePostData(options, function(err: any, response: any) {
                                resolve(response);
                            });
                        } else {
                            resolve(response.body);
                        }
                }).catch(error => { });
        });
        return p;
    }

}