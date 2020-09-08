import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import rank from './routes/rank';
import search from './routes/search';

const app = new Koa(); 
const port = 8000;
const bpOption = { extendTypes: { json: ['application/x-javascript'] } };

app
  .use(bodyParser(bpOption))
  .use(rank.routes())
  .use(search.routes());

app.listen(port, () => console.log(`Listening on PORT ${port}`));