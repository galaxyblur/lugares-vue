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
import Scrape from '../website/scrape';

import config from './config';

var groupsData = [];
var groupsDataOriginalLength = 0;
var stats = {
  lastUSRun: { index: 0, name: '' },
  lastWorldRun: { index: 0, name: '' },
  cities: {
    'city-state': {
      lastRunDate: 0,
      population: 0,
      resultsCount: 0,
      peoplePerResult: 0,
    },
    'city-countrycode': {
      lastRunDate: 0,
      population: 0,
      resultsCount: 0,
      peoplePerResult: 0,
    },
  },
};

var consoleLog = msg => {
  console.log(msg);
};

var loadStatsFile = () => {
  return new Promise((res, rej) => {
    fs.exists(config.statsFilePath, exists => {
      if (exists) {
        fs.readFile(config.statsFilePath, 'utf8', (err, data) => {
          if (err) {
            rej(err);
            return;
          }

          stats = JSON.parse(data);
          res();
        });
      } else {
        rej(`${config.statsFilePath} not found.`);
      }
    });
  });
};

var updateStatsFile = () => {
  fs.writeFile(config.statsFilePath, JSON.stringify(stats, null, 2), 'utf8', (err) => {
    if (err) {
      consoleLog(err);
      return;
    }

    consoleLog(`Saved stats to ${config.statsFilename}`);
  });
};

var writeCommitFile = (cityName, resultsCount) => {
  fs.writeFile(config.commitFilePath, `Auto-update data for "${cityName} (${resultsCount} results)" [ci skip]`, 'utf8', (err) => {
    if (err) {
      consoleLog(err);
      return;
    }

    consoleLog(`Saved stats to ${config.commitFilename}`);
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

var scrapeURL = url => {
  return Scrape.scrapeURL(url);
};

var addSiteScrapeDetailsToItem = (item, scrapeDetails) => {
  item.website_details = {};
  item.website_details.status = scrapeDetails.status;
  item.website_details.logo = scrapeDetails.logo;
  item.website_details.icon = scrapeDetails.icon;
  item.website_details.title = scrapeDetails.title;
  item.website_details.description = scrapeDetails.description;
};

var getCityName = cityObj => {
  var name = [];

  if (cityObj.hasOwnProperty('city') && cityObj.city) {
    name.push(cityObj.city);
  }

  if (cityObj.hasOwnProperty('state') && cityObj.state) {
    name.push(cityObj.state);
  }

  if (cityObj.hasOwnProperty('country') && cityObj.country) {
    name.push(cityObj.country);
  }

  return _.kebabCase(name.join('-'));
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

var doSearch = (city, cityIndex, useWorldList, updateLastRun) => {
  var cityName = getCityName(city);
  var nearBySearch;
  var placeDetailsReq;
  var groupsPromises = [];
  var parameters = {
    keyword  : config.keyword,
    location : [city.latitude, city.longitude],
    rankby   : 'distance'
  };

  consoleLog(`Searching ${cityName}...`);

  nearBySearch = new NearBySearch(config.googleAPIKey, 'json');
  nearBySearch(Object.assign({}, parameters), (err, resSearch) => {
    var cityResult = {
        city_name           : cityName,
        city_rank           : parseInt(city.rank, 10),
        city_population     : parseInt(city.population, 10),
        parameters,
        people_per_result   : Math.round(city.population / resSearch.results.length),
        possible_duplicates : ListingSimilarity.getSimilaritiesFromGoogleSearchResult(resSearch),
        placesResult        : resSearch,
    };

    if (cityResult.placesResult.results && cityResult.placesResult.results.length > 0) {
      placeDetailsReq = new PlaceDetailsRequest(config.googleAPIKey, 'json');

      cityResult.placesResult.results.forEach((item) => {
        groupsPromises.push(new Promise((resolve, reject) => {
          var stdResult;
          var scrapeResult;

          if (item.hasOwnProperty('reference')) {
            placeDetailsReq({ reference: item.reference }, (err, resp) => {
              item.details = resp.result;
              stdResult = conformToStandardResult(item, resp.result);

              if (stdResult.website) {
                scrapeURL(stdResult.website)
                  .then((scrapeResult) => {
                    addSiteScrapeDetailsToItem(stdResult, scrapeResult);
                    resolve(stdResult);
                  });
              } else {
                resolve(stdResult);
              }
            });
          } else {
            stdResult = conformToStandardResult(item);
            resolve(stdResult);
          }
        }));
      });
    }

    Promise.all(groupsPromises).then(writeGroupsData);
    writeRawResult(cityResult);

    if (updateLastRun) {
      if (useWorldList) {
        stats.lastWorldRun.index = cityIndex;
        stats.lastWorldRun.name = cityName;
      } else {
        stats.lastUSRun.index = cityIndex;
        stats.lastUSRun.name = cityName;
      }
    }

    if (stats.cities.hasOwnProperty(cityName) === false) {
      stats.cities[cityName] = {};
    }

    stats.cities[cityName].lastRunDate = Math.round(Date.now() / 1000);
    stats.cities[cityName].population = cityResult.city_population;
    stats.cities[cityName].peoplePerResult = cityResult.people_per_result;
    stats.cities[cityName].resultsCount = cityResult.placesResult.results.length;

    updateStatsFile();
    writeCommitFile(cityName, stats.cities[cityName].resultsCount);
  });
};

var doSearchForCity = (useWorldList, cityNameOrIndex, updateLastRun) => {
  var isCityMatch = c => {
    return c.city === cityNameOrIndex;
  };
  var cities = useWorldList ? citiesWorld : citiesUS;
  var i = _.isNaN(cityNameOrIndex) ? _.findIndex(cities, isCityMatch) : cityNameOrIndex;

  if (i >= cities.length) {
    i = 0;
  }

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
        doSearch(cities[i], i, useWorldList, updateLastRun);
      });
    } else {
      doSearch(cities[i], i, useWorldList, updateLastRun);
    }
  });
};

module.exports.doSearch = (useWorldList, cityNameOrIndex) => {
  loadStatsFile().then(() => {
    let lastRun,
        updateLastRun = false;

    if (typeof cityNameOrIndex === 'undefined') {
      lastRun = useWorldList ? stats.lastWorldRun : stats.lastUSRun;
      cityNameOrIndex = _.isNaN(parseInt(lastRun.index, 10)) ? 0 : lastRun.index + 1;
      updateLastRun = true;

      consoleLog(`Last ran ${lastRun.name} at index ${lastRun.index}.`);
    }

    doSearchForCity(useWorldList, cityNameOrIndex, updateLastRun);
  }).catch(err => {
    consoleLog(err);
  });
};
