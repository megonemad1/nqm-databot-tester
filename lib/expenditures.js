// IGlautie April 2017
module.exports = (function() {
  "use strict";

  const _ = require("lodash");
  const Promise = require("bluebird");
  const Expenditure = require("./expenditure");

  /*
   * Container object for child expenditures
   * Includes methods for populating expenditure list
   * as well as methods for combining population data
   * to produce total predicted expenditure
   */

  class Expenditures {
    constructor(accountsId, api, regionIds, period) {
      this.accountsId = accountsId;
      this.api = api;
      this.regionIds = regionIds;
      this.period = period;
      this.data = [];
    }

    getChildren(line, parent) { // Recursively get the tree of expenditures
      return this.api.getDistinctAsync(this.accountsId, "line", {parent: line, period: this.period})
      .then((response) => {
        const expenditure = new Expenditure(line, parent, response.data.length === 0, this.regionIds);
        this.data.push(expenditure);
        return Promise.each(response.data, (child) => {
          return this.getChildren(child, line);
        });
      });
    }

    getExpenditures(parent) {
      return this.getChildren(parent, 0)
      .then(() => {
        const leaves = _.filter(this.data, (expenditure) => expenditure.isLeaf);

        // For leaves, get detailed expenditure data
        return Promise.each(leaves, (leaf) => {
          return this.api.getDatasetDataAsync(this.accountsId, {
            region: {
              $in: this.regionIds,
            },
            line: leaf.line,
            period: this.period,
          })
          .then((response) => {
            let demographics = [];
            _.each(response.data, (item) => {
              // Save off the base value for the region for this expenditure
              leaf.addRegion(item.region, item.value);
              demographics = [...demographics, ...item.demographics];
            });
            // De-dupe as we will have retrieved demographics for each region
            leaf.setDemographics(_.uniq(demographics));
          });
        });
      })
      .catch((err) => {
        throw new Error(`Failed getting expenditures - ${err.message}`);
      });
    }

    calculateLeafValues(regions) {
      /*
       * For the bottom level items, combine population data
       * with expenditure data to get a predicted value for each
       * region for each year
       */
      const leaves = _.filter(this.data, (item) => item.isLeaf);
      _.each(leaves, (leaf) => {
        _.each(leaf.values, (region, regionId) => {
          let basePop = 0; // Calculate population in starting year
          _.each(leaf.demographics, (age) => {
            basePop += regions[regionId].years[this.period.toString()][age];
          });
          const fixed = leaf.baseValues[regionId] / 2; // Fixed costs
          const vpp = (leaf.baseValues[regionId] / 2) / basePop; // Cost per person
          _.each(regions[regionId].years, (data, year) => {
            let yearPop = 0;
            _.each(leaf.demographics, (age) => {
              yearPop += data[age];
            });
            region[year] = fixed + vpp * yearPop;
          });
        });
      });
    }

    calculateNodeValues() {
      /*
       * For each leaf, find its parents and add the leaf's
       * expenditure for each region for each year
       */
      const nodes = _.filter(this.data, (item) => !item.isLeaf); // Get nodes to initialise
      // Need to zero for each year
      const years = Object.keys(_.sample(_.find(this.data, (item) => item.isLeaf).values));
      _.each(nodes, (node) => { // zero all node values
        _.each(node.values, (region) => {
          _.each(years, (year) => {
            region[year] = 0;
          });
        });
      });
      const leaves = _.filter(this.data, (item) => item.isLeaf);
      _.each(leaves, (leaf) => { // For each leaf recursively find parents
        this.sumChildValues(leaf.parent, leaf);
      });
    }

    sumChildValues(line, child) {
      const parent = _.find(this.data, (item) => item.line === line);
      if (parent) {
        _.each(child.values, (region, regionId) => {
          _.each(region, (data, year) => {
            parent.values[regionId][year] += data;
          });
        });
        this.sumChildValues(parent.parent, parent);
      }
    }
  }

  return Expenditures;
}());
