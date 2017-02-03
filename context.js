module.exports = (function() {

  var TDXApi = require("nqm-api-tdx");

  var authenticate = function(shareKey, shareSecret, cb) {
    this.tdxApi.authenticate(shareKey, shareSecret, (err) => {
      if (err) {
        cb(false);
      } else {
        cb(true);
      }
    });
  };

  function context(config, shareKey, shareSecret) {
    this.tdxApi = new TDXApi(config);
    this.authenticate = authenticate;
  }

  return context;
}());
