module.exports = (function() {

  var debug = console.log;

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

  var error = function(msg) {
    console.log(msg);
  }

  function output() {
    this.debug = debug;
    this.progress = progress;
    this.result = result;
    this.getFileStorePath = getFileStorePath;
    this.error = error;
  }

  return output;
}());
