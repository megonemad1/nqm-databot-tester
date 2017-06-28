module.exports = (function() {

  var TDXApi = require("nqm-api-tdx");
  var Promise = require("bluebird");

  var authenticate = function(shareKey, shareSecret, cb) {
    this.tdxApi.authenticate(shareKey, shareSecret, (err) => {
      if (err) {
        console.log(err);
        cb(false);
      } else {
        cb(true);
      }
    });
  };

  function context(config, shareKey, shareSecret) {
    this.tdxApi = new TDXApi(config);
    this.tdxApi = Promise.promisifyAll(this.tdxApi);
    this.authenticate = authenticate;
  }

  return context;
}());
