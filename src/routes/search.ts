import Router from 'koa-router';
import Mysql from 'mysql';

import naverPostParser from '../parser/naver-post-parser';
import naverPostParam from '../models/params/naver-post-param';
import naverSearchParser from '../parser/naver-search-parser';
import naverSearchParam from '../models/params/naver-search-param';
import naverDataLabParser from '../parser/naver-datalab-parser';
import naverDataLabParam from '../models/params/naver-datalab-param';
import daumPostParser from '../parser/daum-post-parser';
import daumPostParam from '../models/params/daum-post-param';
import youtubeSearchParser from '../parser/youtube-search-parser';
import googleTrendsParser from '../parser/google-trends-parser';
import testParser from '../parser/test-parser';
import naverRelKeywordParser from '../parser/naver-relkeyword-parser';
import auctionParser from '../parser/auction-parser';
import naverDataLab2Parser from '../parser/naver-datalab2-parser';

const naver_post_parser = naverPostParser.Instance;
const naver_search_parser = naverSearchParser.Instance;
const naver_datalab_parser = naverDataLabParser.Instance;
const daum_post_parser = daumPostParser.Instance;
const youtube_search_parser = youtubeSearchParser.Instance;
const google_trends_parser = googleTrendsParser.Instance;
const test_parser = testParser.Instance;
const naver_relkeyword_parser = naverRelKeywordParser.Instance;
const auction_parser = auctionParser.Instance;
const naver_datalab2_parser = naverDataLab2Parser.Instance;
const router = new Router({prefix: '/search'});

var connection = Mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'dtrend'
});


router.get('/:keyword', async (ctx, next) => {
    let keyword_ori = ctx.params.keyword.split('+').join(' ');
    let keyword = keyword_ori.split(' ').join('');
    let response:any = {}; 

    
    connection.query('SELECT * FROM keywordList WHERE keyword = ?', keyword_ori, function (error, results, fields) {
        if (error) {
            console.log(error);
        }
        let count = 0;
        if (results != undefined && results.length > 0) {
            count = results[0].count;
            connection.query('UPDATE keywordList SET count = ? WHERE keyword = ?', [count + 1, keyword_ori], function (error, results, fields) {
                if (error) {
                    console.log(error);
                }
            });
        } else {
            connection.query('INSERT INTO keywordList(keyword, count) VALUES (?, ?)', [keyword_ori, count + 1], function (error, results, fields) {
                if (error) {
                    console.log(error);
                }
            });
        }
    });
    
    naver_post_parser.param = naverPostParam;
    naver_search_parser.param = naverSearchParam;
    daum_post_parser.param = daumPostParam;
    naver_datalab_parser.param = naverDataLabParam;
    naver_datalab2_parser.param = naverDataLabParam;

    const responses = await Promise.all([
        naver_post_parser.getTotalPost(keyword),
        naver_post_parser.getPost('news', keyword_ori),
        naver_datalab_parser.getYearKeywordTrend(keyword),
        naver_datalab_parser.getMonthKeywordTrend(keyword),
        daum_post_parser.getAllPost(keyword),
        //youtube_search_parser.searchVideo(keyword),
        google_trends_parser.getPost(keyword_ori),
        //naver_relkeyword_parser.getRelKeyword(keyword_ori),
        //auction_parser.getAwards(keyword_ori),
        naver_datalab2_parser.getYearKeywordTrend(keyword_ori),
        test_parser.getPost(keyword),
        naver_search_parser.getSearchData(keyword, 11, true),

    ]);

    response.createdDate = new Date();
    response.keyword = keyword_ori;
    response.naverPost = responses[0];
    response.naverNews = responses[1];
    response.naverYearDataLab = responses[2];
    response.naverMonthDataLab = responses[3];
    response.daumPost = responses[4];
    //response.youtubeSearch = responses[6];
    response.googleTrends = responses[5];
    //response.naverRelKeyword = responses[6];
    //response.auctionAwards = responses[9];
    response.naverYearDataLab2 = responses[6];
    response.patent = responses[7];
    response.naverRelKeyword = responses[8];
    ctx.body = response;
});
  
export default router;