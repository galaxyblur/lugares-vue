'use strict';

import strSimilarity from 'string-similarity';

module.exports.getSimilaritiesFromGoogleSearchResult = (res) => {
  let i, ii, c,
      considerations = ['name', 'vicinity'],
      resultsLength = res.results.length,
      similarities = {},
      combined1, sim,
      combined2, score;

  for (i = 0; i < resultsLength; i++) {
    combined1 = [];
    sim = [];

    for (c = 0; c < considerations.length; c++) {
      combined1.push(res.results[i][considerations[c]]);
    }

    for (ii = 0; ii < resultsLength; ii++) {
      combined2 = [];

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
