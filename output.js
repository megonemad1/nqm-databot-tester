module.exports = (function() {

  var debug = console.log;

  var shortid = require("shortid");

  var progress = function(percentage, message) {
    if (message) {
      console.log("Progress: %d% - %s", percentage, message);
    } else {
      console.log("Progress: %d%", percentage);
    }
  };

  var result = function(results) {
    console.log("Results:");
    console.log(JSON.stringify(results));
  };

  var getFileStorePath = function(fileName) {
    return `./outputs/${fileName}`;
  }

  var generateFileStorePath = function(extension) {
    return `./outputs/${shortid.generate()}.${extension}`;
  }

  var error = function(msg) {
    console.log(msg);
  }

  var abort = function(msg) {
    console.log(msg);
    process.exit();
  }

  function output() {
    this.abort = abort;
    this.debug = debug;
    this.progress = progress;
    this.result = result;
    this.getFileStorePath = getFileStorePath;
    this.generateFileStorePath = generateFileStorePath;
    this.error = error;
  }

  return output;
}());
