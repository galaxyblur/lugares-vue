import fs from 'fs';
import path from 'path';

import _ from 'lodash';
import strSimilarity from 'string-similarity';
import beautify from 'json-beautify';

import cities from '../../src/json/cities.json';
import NearBySearch from 'googleplaces/lib/NearBySearch';
import PlaceDetailsRequest from 'googleplaces/lib/PlaceDetailsRequest';

const CITY_LIMIT = 1;
const GOOGLE_API_KEY = 'AIzaSyCs8hRBrRIsSo9El30ywpJWlkDDO0yap9w';
const KEYWORD = 'capoeira';
const GROUPS_FILE = path.resolve(__dirname, '../../src/json/groups.json');
const RAW_RESULTS_FILE = path.resolve(__dirname, '../../src/json/google-search-by-city.json');

var groupsData = [],
    groupsDataOriginalLength = 0,
    index = process.argv[2] ? process.argv[2] : 0;

if (!_.isNaN(parseInt(index, 10))) {
  index = parseInt(index, 10);
}

let getPossibleDupes = function(res) {
  var i, ii, c,
      considerations = ['name', 'vicinity'],
      resultsLength = res.results.length;

  let similarities = {};

  for (i = 0; i < resultsLength; i++) {
    let combined1 = [],
        sim      = [];

    for (c = 0; c < considerations.length; c++) {
      combined1.push(res.results[i][considerations[c]]);
    }

    for (ii = 0; ii < resultsLength; ii++) {
      let combined2 = [],
          score;

      if (i === ii) {
        continue;
      }

      for (c = 0; c < considerations.length; c++) {
        combined2.push(res.results[ii][considerations[c]]);
      }

      score = strSimilarity.compareTwoStrings(combined1.join(' '), combined2.join(' '));

      if (score >= 0.8) {
        sim.push({
          place1 : combined1.join(' '),
          place2 : combined2.join(' '),
          score  : score
        });
      }
    }

    if (sim.length > 0) {
      similarities[res.results[i].place_id] = sim;
    }
  }

  return similarities;
};

let conformToStandardResult = function(item, details) {
  var newItem = {},
      locality, admin1, country;

  newItem.id = item.place_id;
  newItem.names = [];
  newItem.names.push(item.name);
  newItem.image = '';
  newItem.location_text = details ? details.formatted_address : item.vicinity;
  newItem.location_coords = {
    lat: item.geometry.location.lat,
    lng: item.geometry.location.lng,
  };
  newItem.website = details.website;
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

  return newItem;
};

let writeGroupsData = function(searchResultsData) {
  searchResultsData.forEach((result) => {
    let existingIndex = _.findIndex(groupsData, (g) => {
      return g.id === result.id;
    });

    if (existingIndex >= 0) {
      groupsData[existingIndex] = result;
    } else {
      groupsData.push(result);
    }
  });

  console.log(beautify(groupsData, null, 2, 100));

  fs.writeFile(GROUPS_FILE, JSON.stringify(groupsData, null, 2), 'utf8', (err) => {
    if (err) {
      return console.log(err);
    }

    console.log(`Saved groupsData to ${GROUPS_FILE} (${groupsData.length}) (was ${groupsDataOriginalLength})`);
  });
};

let doSearch = function(indexOrName) {
  let nearBySearch,
      placeDetailsReq,
      i = typeof indexOrName === 'number' ? indexOrName : _.findIndex(cities, (c) => { return c.city === indexOrName; }),
      parameters = {
        i,
        keyword         : KEYWORD,
        location        : [cities[i].latitude, cities[i].longitude],
        rankby          : 'distance'
      },
      groupsPromises = [];

  console.log(`Searching ${cities[i].city}, ${cities[i].state}...`);

  nearBySearch = new NearBySearch(GOOGLE_API_KEY, 'json');
  nearBySearch(Object.assign({}, parameters), (err, resSearch) => {
    var cityResult = {
        city_name           : cities[i].city,
        city_rank           : parseInt(cities[i].rank, 10),
        city_population     : parseInt(cities[i].population, 10),
        parameters,
        people_per_result   : cities[i].population / resSearch.results.length,
        possible_duplicates : getPossibleDupes(resSearch),
        placesResult        : resSearch,
    };

    if (cityResult.placesResult.results && cityResult.placesResult.results.length > 0) {
      placeDetailsReq = new PlaceDetailsRequest(GOOGLE_API_KEY, 'json');

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

    /*
    fs.writeFile(RAW_RESULTS_FILE, JSON.stringify(cityResult, null, 2), 'utf8', (err) => {
      if (err) {
        return console.log(err);
      }

      console.log(`Saved raw cityResult to ${RAW_RESULTS_FILE}`);
    });
    */
  });
};

fs.exists(GROUPS_FILE, (exists) => {
  if (exists) {
    fs.readFile(GROUPS_FILE, 'utf8', (err, data) => {
      if (err) {
        console.log(`error reading file ${GROUPS_FILE}: ${err}`);
        return;
      }

      groupsData = JSON.parse(data);
      groupsDataOriginalLength = groupsData.length;
      console.log(`Loaded existing groupsData (${groupsData.length})`);
      doSearch(index);
    });
  } else {
    doSearch(index);
  }
});
