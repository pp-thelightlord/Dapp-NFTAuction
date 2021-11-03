import React, { Component } from "react";
let web3 = require("./getWeb3")
let address = "0xa9ad2597324d04a37cc16DF51D358fB8C04Aa080"
let auctionApp = require("./Instance")
class StartAuction extends Component{
    state = { isrequesting: false, valueID: "", valueprice:"", valueddl:"" }

    startAuction = async() => {
        if (this.state.isrequesting === true)
            return
        this.setState({isrequesting:true})
        //检测并更改默认账户
        await web3.eth.getAccounts().then(
            function(accounts){
                web3.eth.defaultAccount = accounts[0]
            }
        )
        let isApprove = auctionApp.methods.isApprovedForAll(web3.eth.defaultAccount, address).call()
        if (isApprove == false)
        {
            alert("刷新页面以重新授权拍卖行功能")
            this.setState({isrequesting:false})
            return
        }
        let originPrice = this.state.valueprice
        let ID = this.state.valueID
        //处理输入一个不存在ID的情况
        await auctionApp.methods.totalSupply().call().then(
            function(num){
                if (ID >= num)
                {
                    alert("此NFT不存在!")
                    this.setState({isrequesting:false})
                    return
                }
            }
        )
        let ddl = this.state.valueddl
        //处理输入不属于你的ID的情况
        await auctionApp.methods.ownerOf(ID).call().then(
            function(owner){
                if (owner != web3.eth.defaultAccount)
                {
                    alert("你对此NFT没有拥有权!")
                    this.setState({isrequesting:false})
                    return
                }
            }
        )
        if (ID == "" || originPrice == "" || ddl == "" || ddl <= 60)
        {
            alert("输入不符合规范!")
        }
        else{
            try{
                await auctionApp.methods.startAuction(ID, originPrice, ddl).send( {
                        from: web3.eth.defaultAccount,
                        gas: 300000,
                    }
                ).then(
                    function(){
                        alert("成功挂起拍卖:"+ "编号为" + ID + "\n请刷新页面以查看")
                    }
                )
            }
            catch(error){
                alert("该物品已经挂上拍卖架或未被取下!")
                this.setState({isrequesting:false})
                return
            }
        }
        this.setState({isrequesting:false})
    }


    render(){
        if (this.state.isrequesting === true)
        {
            return (
                <h1>拍卖正在创建中,请稍等</h1>
            )
        }
        else return(

            <div style={{textAlign:"center", height:"auto"}}>
              <div style={{height:"auto"}}><h2 className="mb-3" style={{color:"black", backgroundColor:"blanchedalmond"}}>Start an Auction here</h2></div>
              <form>
                <div className="form-group"> <input type="number" className="form-control" placeholder="ID" key="inputID"
                onChange={(e) => {
                    this.setState({
                        valueID: e.target.value
                    });
                }}/> </div>
                <div className="form-group"> <input type="number" className="form-control" placeholder="original price" key="inputPrice"
                onChange={(e) => {
                    this.setState({
                        valueprice: e.target.value
                    });
                }}/> </div>
                <div className="form-group"> <input type="number" className="form-control" placeholder="time limit(seconds), at least 60" key="inputDdl"
                onChange={(e) => {
                    this.setState({
                        valueddl: e.target.value
                    });
                }}/> <small className="form-text text-muted text-right">
                  </small> </div> <button type="button" className="btn btn-primary" id="startAuctionButton" onClick={this.startAuction}>Sell</button>
              </form>
            </div>
        )
    }
}
export default StartAuction;