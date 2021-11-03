import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ForgeNFT from './ForgeNFT';
import App from './App';
import * as serviceWorker from './serviceWorker';
import ListAuction from './ListAuction'
import MyItems from './MyItems';
import StartAuction from './StartAuction';
import Claim from './Claim';
import BiddingItems from './BiddingItems';
import ShowBelongers from './ShowBelongers';
ReactDOM.render(<App />, document.getElementById('accountDisplay'));
ReactDOM.render(<MyItems />, document.getElementById('garage'))
ReactDOM.render(<ForgeNFT />, document.getElementById('forge1'))
ReactDOM.render(<ListAuction />, document.getElementById('biddings'))
ReactDOM.render(<StartAuction />, document.getElementById('startAuction'))
ReactDOM.render(<Claim />, document.getElementById('claimContainer'))
ReactDOM.render(<BiddingItems />, document.getElementById("biddingforItems"))
ReactDOM.render(<ShowBelongers/>, document.getElementById('belongings'))
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
