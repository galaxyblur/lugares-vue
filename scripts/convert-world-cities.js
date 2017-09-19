const fs = require('fs');
const path  = require('path');
const _ = require('lodash');

const CITIES_FILE = path.resolve(__dirname, '../src/json/world-cities.txt');
const CITIES_FILE_JSON = path.resolve(__dirname, '../src/json/world-cities.json');

let rawData = '',
    rawDataArr = [],
    finalData = [];

fs.exists(CITIES_FILE, (exists) => {
  if (exists) {
    fs.readFile(CITIES_FILE, 'utf8', (err, data) => {
      if (err) {
        console.log(`error reading file ${CITIES_FILE}: ${err}`);
        return;
      }

      rawData = data;
      rawDataArr = data.replace(/\n/g, '***').split('***');

      rawDataArr.forEach((city) => {
        let cityArr = city.split(','),
            cityObj = {
              country    : cityArr[0],
              city       : cityArr[1],
              cityAccent : cityArr[2],
              region     : cityArr[3],
              population : parseInt(cityArr[4], 10),
              latitude   : cityArr[5],
              longitude  : cityArr[6],
            };

        if (!_.isNaN(cityObj.population) && cityObj.population >= 1000000) {
          finalData.push(cityObj);
        }
      });

      if (finalData.length > 0) {
        finalData = _.orderBy(finalData, ['population'], ['desc']);
        _.forEach(finalData, (c, i) => {
          c.rank = i + 1;
          console.log(`${c.rank}. ${c.city} ${c.population}`);
        });

        fs.writeFile(CITIES_FILE_JSON, JSON.stringify(finalData, null, 2), 'utf8', (err) => {
          if (err) {
            return console.log(err);
          }

          console.log(`Saved finalData to ${CITIES_FILE_JSON} (${finalData.length})`);
        });
      }
    });
  }
});
