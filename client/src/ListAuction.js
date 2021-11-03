import React, { Component } from "react";
import Moment from 'moment'
let web3 = require("./getWeb3")
let auctionApp = require("./Instance")
let items = [];
let list = [];
let address = "0xa9ad2597324d04a37cc16DF51D358fB8C04Aa080"
let name = [];
let rarity = [];
let price = [];
let highestBidder = [];
let ddl = []
class ListAuction extends Component{
    state = { isRequesting: false  };

    componentDidMount = async() => {
        await this.Refresh()
        this.setState({isReloading: false})
    }

    Refresh = async() => {
        if (this.state.isRequesting === true){
            alert("正在刷新请稍等");
            return;
        }
        this.setState({isReloading: true})
        //设置默认账户
        await web3.eth.getAccounts().then(
            function(accounts){
                web3.eth.defaultAccount = accounts[0]
            }
        );
        //要先授权合约地址能够操作本账户货币
        await auctionApp.methods.isApprovedForAll(web3.eth.defaultAccount, address).call()
        .then(
            function(ret){
                if (ret === false)
                {
                    alert("请先支付一次性gas费用以使用拍卖行功能")
                    auctionApp.methods.setApprovalForAll("0xa9ad2597324d04a37cc16DF51D358fB8C04Aa080", true).send({
                        from: web3.eth.defaultAccount, 
                        gas: 300000,
                    }).then(console.log("approved"))
                }
            }
        )
        items = [];
        //向list中填入所有正在拍卖的物品的序号
        items = await auctionApp.methods.seeAllAuction().call(
            {from: web3.eth.defaultAccount}
        ).then(
            function(items){
                list = []
                var k = 0
                for (var i in items)
                {
                    list[k] = items[k]
                    k++
                }
            }
        )
        await this.getDetails(list);
    }
    getDetails = async(list) => {
 
        //获取这些序号的稀有度和名称信息
        for (var i = 0; i < list.length; i++)
        {
            await auctionApp.methods.see_NFT_info(list[i]).call(
                {from: web3.eth.defaultAccount}
            ).then(
                function(x) {
                    name[i] = x[0];
                    rarity[i] = x[1];
                }
            )
            await auctionApp.methods.see_Auction_Info(list[i]).call().then(
                function(y) {
                    price[i] = y[0]
                    highestBidder[i] = y[1]
                    let stamp = new Date(parseInt(y[5]) * 1000);
                    ddl[i] = Moment(stamp).format('YYYY-MM-DD HH:mm:ss')   
                }
            )
        }
        this.setState({isReloading: false})
    }
    render(){
        if (this.state.isRequesting === true)
            return(
                <h1>正在加载...</h1>
            )
        return (
        <div>
            <button id = "flashAUCTION" style={{display:"flex", justifyContent:"center", marginLeft:"30%"}} onClick={this.Refresh} >refresh</button>
            <h2 style={{textAlign: "center"}}>Items on Auction</h2>
            <table id="tableAuctions" style={{display:"flex",border:"black",justifyContent:"center",overflowX:"scroll"}}>
            <tbody>
              <tr style={{display:"flex",justifyContent:"center", tabSize:"10px"}}>
                <th style={{width:"10%"}}>编号</th>
                <th style={{width:"20%"}}>名称</th>
                <th style={{width:"20%"}}>价格(wei){'\u00A0'}</th>
                <th style={{width:"10%"}}>稀有度{'\u00A0'}</th>
                <th style={{width:"30%"}}>最高出价人{'\u00A0'}</th>
                <th style={{width:"30%"}}>截止时间</th>
              </tr>
                {
                    list.map(function (value, key) {
                        return (
                            <tr key={key} style={{display:"flex",justifyContent:"center"}}>
                                <td style={{width:"10%"}} key={value}>{value}</td>
                                <td style={{width:"20%"}} key={name[key]}>{name[key]}</td>
                                <td style={{width:"20%", wordBreak:"break-all"}} key={price[key]}>{price[key]}{'\u00A0'}</td>
                                <td style={{width:"10%"}} key={value + name[key]}>{rarity[key]}</td>
                                <td style={{width:"30%", wordBreak:"break-all"}} key={price[key] + highestBidder[key]}>{highestBidder[key]}{'\u00A0'}</td>
                                <td style={{width:"30%"}} key={value + key + value}>{ddl[key]}</td>
                            </tr>
                        )
                    })
                }
            </tbody>
            </table>
        </div>
        )
    }
        
    
}

export default ListAuction
