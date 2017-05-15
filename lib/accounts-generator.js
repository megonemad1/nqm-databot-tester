/* eslint-disable no-underscore-dangle */
/* IGlautier April 2017 */
module.exports = (function() {
  "use strict";

  const fs = require("fs");
  const Promise = require("bluebird");
  const _ = require("lodash");

  const getRegion = require("./get-region");
  const Expenditures = require("./expenditures");

  let _output = null;
  let _input = null;
  let _tdxApi = null;
  let _progress = 0;
  let _stream = null;

  const databot = function(input, output, context) {
    _output = output;
    _input = input;
    _tdxApi = context.tdxApi;

    validateInputs();

    const streamOptions = {
      defaultEncoding: "utf8",
      flags: "a",
    };

    const filepath = _output.generateFileStorePath("json");

    _stream = fs.createWriteStream(filepath, streamOptions);

    _stream.on("finish", () => {
      _output.result({outputFilePath: filepath});
    });

    _stream.on("error", (err) => {
      _output.abort(`Writing to file failed - ${err.message}`);
    });

    const regions = {};
    let expenditures = null;

    _tdxApi.getDistinctAsync(_input.accountsId, "demographics", {period: _input.period})
    .then((demographics) => {
      updateProgress(20);

      // Initialise expenditures
      expenditures = new Expenditures(_input.accountsId, _tdxApi, _input.regionIds, _input.period);

      // For each region, get population data
      return Promise.each(_input.regionIds, (regionId) => {
        return getRegion(regionId, _input.projectionId, _input.mappingId, _tdxApi, demographics.data, _input.period)
        .then((region) => {
          regions[regionId] = region;
        });
      });
    })
    .then(() => {
      updateProgress(60);
      // Get expenditure data for each line
      return expenditures.getExpenditures(_input.parentLine);
    })
    .then(() => {
      // Combine population and expenditure data for bottom level children (leaves)
      expenditures.calculateLeafValues(regions);
      // Combine child costs to calculate node values
      expenditures.calculateNodeValues();
      updateProgress(10);

      // Get descriptions for each line for output
      const lines = _.map(expenditures.data, (expenditure) => expenditure.line);

      return _tdxApi.getDatasetDataAsync(_input.accountsId, {
        region: _input.regionIds[0],
        line: {
          $in: lines,
        },
        period: _input.period,
      }, {description: 1, line: 1}, {limit: 1000});
    })
    .then((response) => {
      const descriptions = {};
      _.each(response.data, (item) => {
        descriptions[item.line] = item.description;
      });
      // Write each expenditure to file
      _.each(expenditures.data, (expenditure) => { // Each line
        _.each(expenditure.values, (region, regionId) => { // Each region
          _.each(region, (data, year) => { // Each year
            const output = {
              description: descriptions[expenditure.line],
              region: regionId,
              line: expenditure.line,
              parent: expenditure.parent,
              value: data,
              year: parseInt(year, 10),
            };
            _stream.write(`${JSON.stringify(output)}\n`);
          });
        });
      });
      _stream.end();
    });
  };

  const validateInputs = function() {
    if (!_input.mappingId || !_input.regionIds || !_input.accountsId ||
    !_input.parentLine || !_input.period || !_input.projectionId) {
      _output.abort("You must specify all required inputs, see readme");
    }
  };

  const updateProgress = function(increment) {
    _progress += increment;
    _output.progress(_progress);
  };

  return databot;
}());
