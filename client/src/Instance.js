let ArmorAuction = require("./contracts/ArmorAuction.json")
let web3 = require("./getWeb3")
let address = "0xa9ad2597324d04a37cc16DF51D358fB8C04Aa080"
let auctionApp = new web3.eth.Contract(
    ArmorAuction.abi,
    address
  )

module.exports = auctionApp