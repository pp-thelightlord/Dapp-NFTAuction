import React, { Component } from "react";
import {Route, HashRouter} from "react-router-dom";
import "./App.css";

let web3 = require("./getWeb3")
let auctionApp = require("./Instance")
let accounts;
let k = ''
class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null};
  
  //在render前只执行一次,获取账户return
  componentWillMount = async () => {
    try {
           accounts = web3.eth.getAccounts().then();
           if(accounts[0] !== web3.eth.defaultAccount)
           {
              web3.eth.defaultAccount = accounts[0]
              this.setState({storageValue: web3.eth.defaultAccount})
           }
      accounts = await web3.eth.getAccounts();
      this.setState({web3: web3, accounts, contract: auctionApp, storageValue: accounts[0]}, )      
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
        <b>{this.state.storageValue}</b>
    );
  }
}

export default App;
