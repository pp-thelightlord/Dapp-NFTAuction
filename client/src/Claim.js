import React, { Component } from "react";
let web3 = require("./getWeb3")
let auctionApp = require("./Instance")
class Claim extends Component{
    state = { isrequesting: false, valueID:"" }

    
    claimNFT = async() => {
        this.setState({isrequesting:true})
        //检测并更改默认账户
        await web3.eth.getAccounts().then(
            function(accounts){
                web3.eth.defaultAccount = accounts[0]
            }
        )
        let ID = this.state.valueID
        if (ID == "")
        {
            alert("请输入正确的序号")
            this.setState({isrequesting:false})
            return
        }
        try{
            await auctionApp.methods.claimAuction(ID).send({
                from: web3.eth.defaultAccount,
                gas: 300000,
            }).then(
                function(ret){
                    alert("成功取回" + ID + "请刷新仓库查看")
                }
            )
        }
        catch(error){
            alert("拍卖未结束/你不是最高出价人/你未支付gas费用!请检查下方拍卖行界面和账户余额")
            this.setState({isrequesting:false})
            return
        }
        this.setState({isrequesting:false})
    }
    render(){
        if (this.state.isrequesting)
            return(<b className="navbar-brand">正在取回,请稍等</b>)
        else return(
          <b className="navbar-brand">
          <i className="fa d-inline fa-lg fa-circle"></i>
          <b>Check and Opt your auctions here</b>
          <input type="number" placeholder="ID to claim" id="inputCaimId" style={{marginLeft:"100px"}}
          onChange={(e) => {
            this.setState({
                valueID: e.target.value
            });
            }}></input>
          <button type="button" className="btn btn-secondary" id="claim" style={{marginLeft:"30px"}} onClick={this.claimNFT}>Claim</button>
        </b>
        )
    }
}
export default Claim