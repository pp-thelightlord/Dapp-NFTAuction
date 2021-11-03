import React, { Component } from "react";
let web3 = require("./getWeb3")
let address = "0xa9ad2597324d04a37cc16DF51D358fB8C04Aa080"
let auctionApp = require("./Instance")
class BiddingItems extends Component{
    state = { isrequesting: false, valueID:"" , valueprice:""}
   
    biddingFor = async() => {
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
        let ID = this.state.valueID
        let price = this.state.valueprice
        if (ID == "")
        {
            alert("请输入正确的序号")
            this.setState({isrequesting:false})
            return
        }
        if (price == "")
        {
            alert("请输入正确的价格")
            this.setState({isrequesting:false})
            return
        }
        try{
            auctionApp.methods.bidForWeapon(ID).send(
                {
                    from: web3.eth.defaultAccount,
                    gas: 300000,
                    value: price
                }
            ).then(
                function(){
                    alert("成功竞标:"+ "编号为" + ID + "\n请刷新页面以查看")
                }
            )
        }
        catch(error){
            alert("拍卖价格需要大于现价/拍卖已中止,请重新检查输入")
            this.setState({isrequesting:false})
            return
        }
        this.setState({isrequesting:false})


    }

    render(){
        if (this.state.isrequesting)
            return(<b>正在出价,请稍等</b>)
        else{
            return(
                 <div style={{textAlign:"center", height:"auto"}}>
              <div style={{height:"auto"}}><h2 className="mb-3" style={{color:"black", backgroundColor:"blanchedalmond"}}>Bid For Items</h2></div>
              <form>
                <div className="form-group"> <input type="number" className="form-control" placeholder="ID" key="inputID"
                onChange={(e) => {
                    this.setState({
                        valueID: e.target.value
                    });
                }}/> </div>
                <div className="form-group"> <input type="number" className="form-control" placeholder="your price" key="inputPrice"
                onChange={(e) => {
                    this.setState({
                        valueprice: e.target.value
                    });
                }}/> </div>
                <button type="button" className="btn btn-primary" id="bidFor" onClick={this.biddingFor}>Bid</button>
              </form>
            </div>
            )
        }
    }
}





export default BiddingItems