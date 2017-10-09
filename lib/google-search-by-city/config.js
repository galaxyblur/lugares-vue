'use strict';

let path = require('path');
let config = {};

config.googleAPIKey = process.env.GOOGLE_PLACES_API_KEY;
config.keyword = 'capoeira';
config.commitFilename = 'google-search-by-city-commit.txt';
config.commitFilePath = path.resolve(__dirname, '../../' + config.commitFilename);
config.statsFilename = 'stats.json';
config.statsFilePath = path.resolve(__dirname, '../../src/json/' + config.statsFilename);
config.groupsFilename = 'groups.json';
config.groupsFilePath = path.resolve(__dirname, '../../src/json/' + config.groupsFilename);
config.rawResultsFilename = 'google-search-by-city.json';
config.rawResultsFilePath = path.resolve(__dirname, '../../src/json/' + config.rawResultsFilename);

module.exports = config;
