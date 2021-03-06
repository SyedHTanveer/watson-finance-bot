/* eslint-disable no-case-declarations */
import axios from 'axios';
import dotenv from 'dotenv';
import DiscoveryV1 from 'ibm-watson/discovery/v1';
import { IamAuthenticator } from 'ibm-watson/auth';
import moment from 'moment';

dotenv.config({ silent: true });

// eslint-disable-next-line import/prefer-default-export
export const handleQuestion = (req, res) => {
  const response = {};
  switch (req.body.question) {
    case 'stock':
      const end = moment().format('YYYY-MM-DD');
      const start = moment().subtract(1, 'week').format('YYYY-MM-DD');
      console.log(`https://api.polygon.io/v2/aggs/ticker/${req.body.ticker}/range/1/day/${start}/${end}?sort=desc&apiKey=${process.env.POLYGON_API_KEY}`);
      axios.get(`https://api.polygon.io/v2/aggs/ticker/${req.body.ticker}/range/1/day/${start}/${end}?sort=desc&apiKey=${process.env.POLYGON_API_KEY}`)
        .then((result) => {
          console.log(result);
          const prevClose = result.data.results[0].c;
          const prevPrevClose = result.data.results[1].c;
          const pch = (prevClose - prevPrevClose) / prevPrevClose * 100;
          response.pch = pch.toFixed(2);
          response.volume = (result.data.results[0].v / 1000).toFixed(1);
          response.price = prevClose;
          return axios.get(`https://api.polygon.io/v1/meta/symbols/${req.body.ticker}/news?perpage=5&apiKey=${process.env.POLYGON_API_KEY}`);
        })
        .then((result) => {
          result.data.forEach((newsArticle, i) => {
            response[`headline${i}`] = newsArticle.title;
            response[`url${i}`] = newsArticle.url;
            response[`source${i}`] = newsArticle.source;
            response[`image${i}`] = newsArticle.image;
          });
          res.json(response);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json(error);
        });
      break;
    case 'biggest-movers':
      axios.get(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/gainers?apiKey=${process.env.POLYGON_API_KEY}`)
        .then((result) => {
          result.data.tickers.forEach((stock, i) => {
            if (i < 10) {
              response[`stock${i}`] = stock.ticker;
              response[`pch${i}`] = stock.todaysChangePerc.toFixed(2);
            }
          });
          // TODO: add sentiment biggest gainers here
          res.json(response);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json(error);
        });
      break;
    case 'biggest-losers':
      axios.get(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/losers?apiKey=${process.env.POLYGON_API_KEY}`)
        .then((result) => {
          result.data.tickers.forEach((stock, i) => {
            if (i < 10) {
              response[`stock${i}`] = stock.ticker;
              response[`pch${i}`] = stock.todaysChangePerc.toFixed(2);
            }
          });
          // TODO: add sentiment biggest gainers here
          res.json(response);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json(error);
        });
      break;
    case 'discovery':
      const year = moment().year();
      const month = moment().month();
      const day = moment().date();
      const discovery = new DiscoveryV1({
        version: '2019-04-30',
        authenticator: new IamAuthenticator({ apikey: process.env.DISCOVERY_API_KEY }),
        url: process.env.DISCOVERY_URL,
      });

      const queryParams = {
        environmentId: 'system',
        collectionId: 'news-en',
        query: `enriched_text.keywords.text::${req.body.company},publication_date::"${`${year}-${month}-${day}`}"`,
        _return: 'title, url, enriched_text.sentiment',
        count: 5,
      };

      discovery.query(queryParams)
        .then((queryResponse) => {
          queryResponse.result.results.forEach((news, i) => {
            const { title } = news;
            const { url } = news;
            const { label } = news.enriched_text.sentiment.document;
            response[`news${i}`] = {
              title,
              url,
              label,
            };
          });
          res.send(response);
        })
        .catch((err) => {
          console.log('error:', err);
        });
      break;
    default:
      res.status(500).json({ error: 'unknown parameters' });
      break;
  }
};
