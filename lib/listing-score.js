'use strict';

module.exports.calculate = (item) => {
  let capoeiraInName = item.names[0].toLowerCase().indexOf('capoeira') >= 0 ? 10 : 0,
      capoeiraInWebsite = item.website.toLowerCase().indexOf('capoeira') >= 0 ? 10 : 0,
      schedule = item.schedule_text ? 5 : 0,
      score = capoeiraInName + capoeiraInWebsite + schedule;

  return score;
};
