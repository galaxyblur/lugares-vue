'use strict';

let path = require('path');
let config = {};

config.googleAPIKey = 'AIzaSyCs8hRBrRIsSo9El30ywpJWlkDDO0yap9w';
config.keyword = 'capoeira';
config.groupsFilename = 'groups.json';
config.groupsFilePath = path.resolve(__dirname, '../../src/json/' + config.groupsFilename);
config.rawResultsFilename = 'google-search-by-city.json';
config.rawResultsFilePath = path.resolve(__dirname, '../../src/json/' + config.rawResultsFilename);
config.lastRunCityFilename = 'groups-last-run-city.json';
config.lastRunCityFilePath = path.resolve(__dirname, '../../src/json/' + config.lastRunCityFilename);
config.lastRunWorldCityFilename = 'groups-last-run-world-city.json';
config.lastRunWorldCityFilePath = path.resolve(__dirname, '../../src/json/' + config.lastRunWorldCityFilename);

module.exports = config;
