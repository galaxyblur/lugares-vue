require('babel-core/register');
require('babel-polyfill');

var app = require('./app'),
    index = process.argv[2] ? process.argv[2] : 0,
    useWorldCities = process.argv[3] ? process.argv[3] === 'world' : false;

app.doSearchForCity(index, useWorldCities);
