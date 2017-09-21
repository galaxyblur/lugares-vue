'use strict';

import fs from 'fs';
import path from 'path';

import _ from 'lodash';
import strSimilarity from 'string-similarity';
import beautify from 'json-beautify';

import citiesUS from '../../src/json/cities.json';
import citiesWorld from '../../src/json/world-cities.json';
import NearBySearch from 'googleplaces/lib/NearBySearch';
import PlaceDetailsRequest from 'googleplaces/lib/PlaceDetailsRequest';

import ListingScore from '../listing-score';
import ListingSimilarity from '../listing-similarity';
import config from './config';

import lastRunCity from '../../src/json/groups-last-run-city.json';
import lastRunWorldCity from '../../src/json/groups-last-run-world-city.json';

var groupsData = [];
var groupsDataOriginalLength = 0;

var consoleLog = msg => {
  console.log(msg);
};

var updateLastRunFile = (useWorldList, lastRun) => {
  let filename = useWorldList ? config.lastRunWorldCityFilename : config.lastRunCityFilename;
  let filePath = useWorldList ? config.lastRunWorldCityFilePath : config.lastRunCityFilePath;

  fs.writeFile(filePath, JSON.stringify(lastRun, null, 2), 'utf8', (err) => {
    if (err) {
      return consoleLog(err);
    }

    consoleLog(`Saved last run to ${filename}`);
  });
};

var writeGroupsData = newResultsData => {
  newResultsData.forEach(result => {
    let existingIndex = _.findIndex(groupsData, g => {
      return g.id === result.id;
    });

    if (existingIndex >= 0) {
      groupsData[existingIndex] = result;
    } else {
      groupsData.push(result);
    }
  });

  consoleLog(beautify(groupsData[groupsData.length - 1], null, 2, 100));

  fs.writeFile(config.groupsFilePath, JSON.stringify(groupsData, null, 2), 'utf8', (err) => {
    if (err) {
      return consoleLog(err);
    }

    consoleLog(`Saved groupsData to ${config.groupsFilename} (${groupsData.length}) (was ${groupsDataOriginalLength})`);
  });
};

var writeRawResult = rawResultData => {
  fs.writeFile(config.rawResultsFilePath, JSON.stringify(rawResultData, null, 2), 'utf8', (err) => {
    if (err) {
      return consoleLog(err);
    }

    consoleLog(`Saved raw rawResultData to ${config.rawResultsFilename}`);
  });
};

var conformToStandardResult = (item, details) => {
  let newItem = {};
  let locality = '';
  let admin1 = '';
  let country = '';

  newItem.id = item.place_id;
  newItem.names = [];
  newItem.names.push(item.name);
  newItem.image = '';
  newItem.location_text = details ? details.formatted_address : item.vicinity;
  newItem.location_coords = {
    lat: item.geometry.location.lat,
    lng: item.geometry.location.lng,
  };
  newItem.website = typeof details.website === 'string' ? details.website : '';
  newItem.style = '';
  newItem.teachers = [];
  newItem.permanently_closed = details ? details.permanently_closed === true : false;
  newItem.schedule_text = (details && details.opening_hours) ? details.opening_hours.weekday_text.join('\n') : '';

  if (details && details.hasOwnProperty('address_components')) {
    locality = _.find(details.address_components, (c) => {
      return c.types.indexOf('locality') >= 0;
    });
    newItem.location_locality = locality ? locality.long_name : '';

    admin1 = _.find(details.address_components, (c) => {
      return c.types.indexOf('administrative_area_level_1') >= 0;
    });
    newItem.location_administrative_area_level_1 = admin1 ? admin1.short_name : '';

    country = _.find(details.address_components, (c) => {
      return c.types.indexOf('country') >= 0;
    });
    newItem.location_country = country ? country.short_name : '';
  }

  newItem.score = ListingScore.calculate(newItem);

  return newItem;
};

var doSearch = city => {
  var nearBySearch;
  var placeDetailsReq;
  var groupsPromises = [];
  var parameters = {
    keyword  : config.keyword,
    location : [city.latitude, city.longitude],
    rankby   : 'distance'
  };

  consoleLog(`Searching ${city.city}, ${city.state}, ${city.country}...`);

  nearBySearch = new NearBySearch(config.googleAPIKey, 'json');
  nearBySearch(Object.assign({}, parameters), (err, resSearch) => {
    var cityResult = {
        city_name           : city.city,
        city_rank           : parseInt(city.rank, 10),
        city_population     : parseInt(city.population, 10),
        parameters,
        people_per_result   : city.population / resSearch.results.length,
        possible_duplicates : ListingSimilarity.getSimilaritiesFromGoogleSearchResult(resSearch),
        placesResult        : resSearch,
    };

    if (cityResult.placesResult.results && cityResult.placesResult.results.length > 0) {
      placeDetailsReq = new PlaceDetailsRequest(config.googleAPIKey, 'json');

      cityResult.placesResult.results.forEach((item) => {
        groupsPromises.push(new Promise((resolve, reject) => {
          let details = {};

          if (item.hasOwnProperty('reference')) {
            details = placeDetailsReq({ reference: item.reference }, (err, resp) => {
              item.details = resp.result;
              resolve(conformToStandardResult(item, resp.result));
            });
          } else {
            resolve(conformToStandardResult(item));
          }
        }));
      });
    }

    Promise.all(groupsPromises).then(writeGroupsData);
    writeRawResult(cityResult);
  });
};

var doSearchForCity = (useWorldList, cityNameOrIndex, updateLastRun) => {
  var isCityMatch = c => {
    return c.city === cityNameOrIndex;
  };
  var cities = useWorldList ? citiesWorld : citiesUS;
  var i = _.isNaN(cityNameOrIndex) ? _.findIndex(cities, isCityMatch) : cityNameOrIndex;

  consoleLog(`Now running ${cities[i].city} at index ${i}.`);

  fs.exists(config.groupsFilePath, (exists) => {
    if (exists) {
      fs.readFile(config.groupsFilePath, 'utf8', (err, data) => {
        if (err) {
          consoleLog(`Error reading file ${config.groupsFilename}: ${err}`);
          return;
        }

        groupsData = JSON.parse(data);
        groupsDataOriginalLength = groupsData.length;
        consoleLog(`Loaded existing groupsData (${groupsData.length})`);
        doSearch(cities[i]);
      });
    } else {
      doSearch(cities[i]);
    }
  });

  if (updateLastRun) {
    updateLastRunFile(useWorldList, {
      index: i,
      name: cities[i].city,
    });
  }
};

module.exports.doSearch = (useWorldList, cityNameOrIndex) => {
  var lastRunFile;

  if (typeof cityNameOrIndex === 'undefined') {
    lastRunFile = useWorldList ? config.lastRunWorldCityFilePath : config.lastRunCityFilePath;

    fs.exists(lastRunFile, exists => {
      let i;

      if (exists) {
        fs.readFile(lastRunFile, 'utf8', (err, lastRun) => {
          lastRun = JSON.parse(lastRun);
          consoleLog(`Last ran ${lastRun.name} at index ${lastRun.index}.`);

          cityNameOrIndex = lastRun.index + 1;
          doSearchForCity(useWorldList, cityNameOrIndex, true);
        });
      } else {
        doSearchForCity(useWorldList, cityNameOrIndex, true);
      }
    });
  } else {
    doSearchForCity(useWorldList, cityNameOrIndex);
  }
};
