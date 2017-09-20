require('babel-core/register');
require('babel-polyfill');

var search = require('./search'),
    index = process.argv[2] ? process.argv[2] : 0,
    useWorldCities = process.argv[3] ? process.argv[3] === 'world' : false;

search.doSearchForCity(index, useWorldCities);
