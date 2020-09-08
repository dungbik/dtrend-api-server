import { ParserParam } from '../parser-param';

const parserParam: ParserParam = {
  url: 'https://trends.google.co.kr/trends/trendingsearches/daily/rss?geo=KR',
  querySelector: 'item',
  parserSelector: (arg0: any, elem: any) => {
    const data = arg0(elem);
    return {
      title: data.find('title').text(),
      traffic: data.find('ht\\:approx_traffic').text(),
    };
  }
};

export default parserParam;
