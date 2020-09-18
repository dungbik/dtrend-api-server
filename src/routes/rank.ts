
import Router from 'koa-router';
import fs from 'fs';
import Mysql from 'mysql';

import googleParser from '../parser/google-rank-parser';
import googleParam from '../models/params/google-rank-param';
import naverParser from '../parser/naver-rank-parser';
import naverParam from '../models/params/naver-rank-param';
import daumParser from '../parser/daum-rank-parser';
import daumParam from '../models/params/daum-rank-param';

const nParser = naverParser.Instance;
const gParser = googleParser.Instance;
const dParser = daumParser.Instance;
const router = new Router({ prefix:'/ranking' });

var connection = Mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'dtrend'
});

async function getRanking() {    
  let p = await new Promise((resolve, reject) => {
      connection.query('SELECT keyword, count FROM keywordList ORDER BY count DESC LIMIT 10', function (error, results, fields) {
        if (error) {
          reject('');
          console.log(error);
        }
        resolve(results);
      });
  });
  return p;
};

async function refreshData(response: any) {
  nParser.param = naverParam;
  gParser.param = googleParam;
  dParser.param = daumParam;

  const responses = await Promise.all([
    nParser.getRank(),
    gParser.getRank(),
    dParser.getRank()
  ]);

  response.naver = responses[0];
  response.google = responses[1];
  response.daum = responses[2];

  const dataStr = JSON.stringify(response);
  fs.writeFileSync('test.json', dataStr);
}

router.get('/', async (ctx, next) => {
  let refresh = true;
  let response:any = { createdDate: new Date().toLocaleString("ko-KR", {timeZone: "Asia/Seoul"}) };
  response.dtrend = await getRanking();

  try {  
    const dataBuffer = fs.readFileSync('test.json');
    const dataJson = dataBuffer.toString();
    const json_obj = JSON.parse(dataJson);
    var old = new Date(json_obj.createdDate);
    let gap = new Date(new Date().toLocaleString("ko-KR", {timeZone: "Asia/Seoul"})).getTime() - old.getTime();
    let min_gap = gap / 1000 / 60;
    if (min_gap < 30) { //30분마다 갱신
      json_obj.dtrend = response.dtrend; // dtrend Ranking은 항상 갱신
      refresh = false;
    }
    ctx.body = json_obj;
  } catch (err) {
  }
  refresh = true;
  if (refresh) {
    refreshData(response);
  }
});

export default router;