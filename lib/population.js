/* IGlautier April 2017 */
module.exports = (function() {
  "use strict";

  /*
   * Stores population data for a region
   */

  const _ = require("lodash");

  class Population {
    constructor(years) {
      this.years = {};
      _.each(years, (year) => {
        this.years[year] = {};
      });
    }

    addYearData(year, data) {
      this.years[year] = {};
      _.each(data, (item) => {
        this.years[year][item._id] = item.population;
      });
    }
  }

  return Population;
}());
