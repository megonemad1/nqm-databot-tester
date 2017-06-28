if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " [test.json] bot.js");
    process.exit(-1);
}
 
var test_config = {};
var bot_uri = process.argv[2];

if (bot_uri.indexOf("./") <= -1){
   bot_uri = "./"+bot_uri;
}


if (process.argv.length > 3) {

   test_config = require(bot_uri);
   bot_uri = process.argv[3]
   if (bot_uri.indexOf("./") <= -1){
      bot_uri = "./"+bot_uri;
   }
}

var Output = require("./output");
var Context = require("./context");
var _ = require("lodash");
var fs = require("fs");


var output = new Output();
var identity = require("./identity.json");
var context = new Context(identity.host);//{tdxHost: "https://tdx.nq-m.com"});

var identity = identity.auth;
var input ={};
if (test_config.input) {
    var input = test_config.input
}

var output_set ={};
if (test_config.output) {
    var output_set = test_config.output
}
/*
exsample
 {
  accountsId: "r1g8CEvwyW",
  mappingId: "HkeLv25NRg",
  parentLine: 799,
  period: 2016,
  projectionId: "SkxJW0bQxb",
  regionIds: [
    "E10000014"
  ],
};*/

const databot = require(bot_uri);

context.authenticate(identity.key, identity.secret, (authenticated) => {
  if (authenticated) {
    databot(input, output, context);
  } else {
    output.debug("Could not authenticate aborting");
  }
});

