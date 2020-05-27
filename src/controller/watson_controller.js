import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ silent: true });

// eslint-disable-next-line import/prefer-default-export
export const handleQuestion = (req, res) => {
  const response = {};
  switch (req.body.question) {
    case 'stock':
      axios.get(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${req.body.ticker}?apiKey=${process.env.POLYGON_API_KEY}`)
        .then((result) => {
          response.pch = result.data.ticker.todaysChangePerc;
          response.volume = result.data.ticker.day.v;
          response.price = result.data.ticker.lastQuote.p;
          res.json(response);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json(error);
        });
      break;
    case 'news':
      axios.get(`https://api.polygon.io/v1/meta/symbols/AAPL/news?perpage=5&apiKey=${process.env.POLYGON_API_KEY}`)
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
    default:
      res.status(500).json({ error: 'unknown parameters' });
      break;
  }
};
