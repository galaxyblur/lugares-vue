'use strict';

import fetch from 'node-fetch';

const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImdhbGF4eWJsdXJAZ21haWwuY29tIiwiaWF0IjoxNTA3MzE0Mjk3LCJleHAiOjE1Mzg4NTAyOTd9.qaGNUf9Hp3GzP9MaO5tCHQqAlYVM0wKNWEa108TgT9f-iwRxwp3Ts6hVAg4wKM1IlXFcXFvlyEVlSAGreTVAFl2ztmJNwzFILbeL9X7h8uELRW6AQBuUwZAnfJmhQOYrxZI7ogaoeAEE5UtV19qzLVMwd1_ZY3gCly68wjQ6d8BfY41QkIjCdfmQoNjMpiBnJg74DIo9niM38MVKhhqWIC_jOaZmn_frXdvDgxIQrjhiGFdOSWvn4_YpooN6SwAF1iLiZDoMv4Pw1dsZz_b00axi1VYvHS5injPcrtSGK52-WtY4GnD8p0loPvRh90C1z28U-l6THLq4R0oRFYo1wsjwIn1fwSh3YrRJdaajEO_j-iP4xXNblMXvnOUrXgnFEFe5yJ14H48HUkXWqKBYol4ZV-EpmcOvdn0kduN8C4jF1YdAV0-58JcUin50FRoBfEo1SRnp9mdTYXSJAfQTLmLNT0R6HEBIdqREJlKBaWikjZVe8Dommtrr__wQQ5na_-GHd0hVFxkJuLMCwlY4Re2_bt50v8BhnMZLsgMIXHX1vv9xa_A2H24zEN8i0loMWWXOSa38FI1TdSjNlbLwokNy1WgrZVFdjPKRt_wQ3cInDA9ieAdTmGrEmVIQnbJdU_MH2HUPEQulPTRjHjUTNCPz4VLqM3V0i7mzguuPavc';

module.exports.scrapeURL = (url) => {
  const prom = fetch(`https://page.rest/fetch?token=${token}&url=${url}&selector=a`);

  return prom.then((res) => {
      return res.json();
    })
    .catch(err => console.error(err));
};
