require('babel-core/register');
require('babel-polyfill');

var _ = require('lodash');
var search = require('./search');
var arg2 = process.argv[2] === 'world' ? 'world' : 'US';
var useWorldCities = arg2 === 'world' ? true : false;
var index = process.argv[3] ? process.argv[3] : undefined;

if (typeof index !== 'undefined' && !_.isNaN(parseInt(index, 10))) {
  index = parseInt(index, 10);
}

search.doSearch(useWorldCities, index);
