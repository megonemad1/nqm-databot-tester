module.exports = (function() {

  var debug = console.log;

  var progress = function(percentage, message) {
    console.log("%d% - %s", percentage, message);
  };

  var result = function(results) {
    console.log("Results:");
    console.log(JSON.stringify(results));
  };

  var getFileStorePath = function(fileName) {
    return `./outputs/${fileName}`;
  }

  function output() {
    this.debug = debug;
    this.progress = progress;
    this.result = result;
    this.getFileStorePath = getFileStorePath;
  }

  return output;
}());