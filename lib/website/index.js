require('babel-core/register');
require('babel-polyfill');

var _ = require('lodash');
var scrape = require('./scrape');
var arg2 = process.argv[2];

scrape.scrapeURL(arg2);
