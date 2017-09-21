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

var groupsData = [];
var groupsDataOriginalLength = 0;

var consoleLog = msg => {
  console.log(msg);
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

  consoleLog(beautify(groupsData, null, 2, 100));

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

module.exports.doSearchForCity = (cityNameOrIndex, useWorldList) => {
  var i = cityNameOrIndex;
  var cities = useWorldList ? citiesWorld : citiesUS;
  var isCityMatch = c => {
    return c.city === cityNameOrIndex;
  };

  if (_.isNaN(cityNameOrIndex)) {
    i = _.findIndex(cities, isCityMatch);
  }

  fs.exists(config.groupsFilePath, (exists) => {
    if (exists) {
      fs.readFile(config.groupsFilePath, 'utf8', (err, data) => {
        if (err) {
          consoleLog(`error reading file ${config.groupsFilename}: ${err}`);
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
};
