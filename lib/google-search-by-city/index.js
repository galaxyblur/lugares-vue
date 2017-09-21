require('babel-core/register');
require('babel-polyfill');

var _ = require('lodash');

var search = require('./search'),
    index = process.argv[2] ? process.argv[2] : 0,
    useWorldCities = process.argv[3] ? process.argv[3] === 'world' : false;

if (!_.isNaN(parseInt(index, 10))) {
  index = parseInt(index, 10);
}

search.doSearchForCity(index, useWorldCities);
