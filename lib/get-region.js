// Created by Ivan April 2017
module.exports = (function() {
  "use strict";

  /*
   * For a given region code, retrieve population data
   * for the given set of demographics
   */
  const _ = require("lodash");
  const Promise = require("bluebird");

  const Population = require("./population");

  const getRegion = function(region, projectionId, mappingId, api, demographics, period) {
    let lsoas = null;
    let regionData = null;
    return api.getDatasetDataAsync(mappingId, {parentId: region, childType: "lsoa"}, {childId: 1}, {limit: 1000})
    .then((response) => { // Retrieve lsoa codes for the region
      lsoas = _.map(response.data, (item) => item.childId);
      return api.getDistinctAsync(projectionId, "year", {
        year: {
          $gte: period,
        },
      }); // Retrieve years over which projection runs
    })
    .then((response) => {
      const years = response.data;
      regionData = new Population(years);
      return Promise.each(years, (year) => { // Each year, retrieve population totals grouped by demographic
        const pipeline = [
          {
            $match: {
              age: {
                $in: demographics,
              },
              area: {
                $in: lsoas,
              },
              year,
            },
          },
          {
            $group: {
              _id: "$age",
              population: {
                $sum: "$data",
              },
            },
          },
        ];
        return api.getAggregateDataAsync(projectionId, pipeline)
        .then((response) => {
          regionData.addYearData(year, response.data);
        });
      });
    })
    .then(() => {
      return regionData;
    })
    .catch((err) => {
      throw new Error(`Could not get population data for ${region} - ${err.message}`);
    });
  };

  return getRegion;
}());
