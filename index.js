var Output = require("./output");
var Context = require("./context");
var output = new Output();
var context = new Context({tdxHost: "https://tdx.nq-m.com"});

var identity = {
  key: "",
  secret: "",
};

var input = {
  /* Your databot inputs here */

};

function databot(input, output, context) {
  /* Your databot code here */

}


context.authenticate(identity.key, identity.secret, (authenticated) => {
  if (authenticated) {
    databot(input, output, context);
  } else {
    output.debug("Could not authenticate aborting");
  }
});
