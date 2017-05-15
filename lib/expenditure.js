/* IGlautier April 2017 */
module.exports = (function() {
  "use strict";

  const _ = require("lodash");

  class Expenditure {
    constructor(line, parent, isLeaf, regionIds) {
      this.line = line;
      this.parent = parent;
      this.isLeaf = isLeaf; // leaf is a bottom level cost item
      this.baseValues = {};
      this.values = {};
      _.each(regionIds, (region) => {
        this.values[region] = {};
      });
      this.demographics = [];
    }

    addRegion(region, value) {
      this.baseValues[region] = value;
    }

    setDemographics(demographics) { // Sections of population relevant to this expenditure
      this.demographics = demographics;
    }
  }

  return Expenditure;
}());
