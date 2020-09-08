import { ParserParam } from '../parser-param';

const parserParam: ParserParam = {
  url: 'https://www.daum.net/',
  querySelector: '.slide_favorsch',
  parserSelector: (arg0: any, elem: any) => {
    const data = arg0(elem);
    return {
      title: data.children().text()
    };
  }
};

export default parserParam;
