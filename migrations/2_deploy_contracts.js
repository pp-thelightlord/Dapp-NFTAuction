var SimpleStorage = artifacts.require("./ArmorAuction.sol");

module.exports = function(deployer) {
  deployer.deploy(ArmorAuction);
};
