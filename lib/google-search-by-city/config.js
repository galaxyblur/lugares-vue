'use strict';

let path = require('path');
let config = {};

config.googleAPIKey = 'AIzaSyCs8hRBrRIsSo9El30ywpJWlkDDO0yap9w';
config.keyword = 'capoeira';
config.statsFilename = 'stats.json';
config.statsFilePath = path.resolve(__dirname, '../../src/json/' + config.statsFilename);
config.groupsFilename = 'groups.json';
config.groupsFilePath = path.resolve(__dirname, '../../src/json/' + config.groupsFilename);
config.rawResultsFilename = 'google-search-by-city.json';
config.rawResultsFilePath = path.resolve(__dirname, '../../src/json/' + config.rawResultsFilename);

module.exports = config;
