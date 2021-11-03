const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      host:"127.0.0.1",
      port: 7545,
      from: "0x0d48d469a40044208316cf46F7C4CB0A8Af311c6",
      network_id: "*"
    }
  },compilers:{
    solc:{
      version: "0.8.0"
    }
  }
};
