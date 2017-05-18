var Output = require("./output");
var Context = require("./context");
var _ = require("lodash");
var fs = require("fs");

var output = new Output();
var context = new Context({tdxHost: "https://tdx.nqminds.com"});

var identity = {
  key: "",
  secret: "",
};

var input = {
  /* Your databot inputs here */
  accountsId: "r1g8CEvwyW",
  mappingId: "HkeLv25NRg",
  parentLine: 799,
  period: 2016,
  projectionId: "SkxJW0bQxb",
  regionIds: [
    "E10000014"
  ],
};

const databot = require("./lib/accounts-generator");


context.authenticate(identity.key, identity.secret, (authenticated) => {
  if (authenticated) {
    databot(input, output, context);
  } else {
    output.debug("Could not authenticate aborting");
  }
});

