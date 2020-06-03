import axios from 'axios';
import dotenv from 'dotenv';
import DiscoveryV1 from 'ibm-watson/discovery/v1';
import { IamAuthenticator } from 'ibm-watson/auth';

dotenv.config({ silent: true });


export const handleDiscovery = (req, res) => {
  const discovery = new DiscoveryV1({
    version: '2019-04-30',
    authenticator: new IamAuthenticator({ apikey: process.env.DISCOVERY_API_KEY }),
    url: process.env.DISCOVERY_URL,
  });

  const queryParams = {
    environmentId: 'system',
    collectionId: 'news-en',
    query: `enriched_text.keywords.text::${req.body.company},publication_date::"2020-06-02"`,
    _return: 'title, url, enriched_text.sentiment',
    count: 5,
  };

  discovery.query(queryParams)
    .then((queryResponse) => {
      res.send(JSON.stringify(queryResponse, null, 2));
    })
    .catch((err) => {
      console.log('error:', err);
    });
};

// eslint-disable-next-line import/prefer-default-export
export const handleQuestion = (req, res) => {
  const response = {};
  switch (req.body.question) {
    case 'stock':
      axios.get(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${req.body.ticker}?apiKey=${process.env.POLYGON_API_KEY}`)
        .then((result) => {
          response.pch = result.data.ticker.todaysChangePerc.toFixed(2);
          response.volume = (result.data.ticker.day.v / 1000).toFixed(1);
          response.price = result.data.ticker.lastQuote.p;
          return axios.get(`https://api.polygon.io/v1/meta/symbols/AAPL/news?perpage=5&apiKey=${process.env.POLYGON_API_KEY}`);
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
    default:
      res.status(500).json({ error: 'unknown parameters' });
      break;
  }
};
