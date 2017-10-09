'use strict';

import fetch from 'node-fetch';

const token = process.env.PAGE_REST_API_TOKEN;

module.exports.scrapeURL = (url) => {
  const prom = fetch(`https://page.rest/fetch?token=${token}&url=${url}&selector=a`);

  return prom.then((res) => {
      return res.json();
    })
    .catch(err => console.error(err));
};
