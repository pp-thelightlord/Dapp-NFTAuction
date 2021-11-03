import React, { Component } from "react";
let web3 = require("./getWeb3")
let auctionApp = require("./Instance")
class ForgeNFT extends Component{
    //这个状态指的是是否正在等待请求结果
    state = { isrequesting: false,value:"" }

    forgeAnNFT = async() => { 
        if (this.state.isrequesting === true)
            return
        this.setState({isrequesting:true})
        //检测并更改默认账户
        await web3.eth.getAccounts().then(
            function(accounts){
                web3.eth.defaultAccount = accounts[0]
            }
        )
        var gas = 3000000
        //更新当前账户信息
        let accounts = web3.eth.getAccounts().then(
            function(accounts){
                web3.eth.defaultAccount = accounts[0]
            }
        );
        //10^6wei 铸币需要的钱
        let NFTname = this.state.value
        try{
            await auctionApp.methods.applyWeapon(NFTname).send( {
                    from: web3.eth.defaultAccount,
                    gas: 3000000,
                    value: 1000001
                }
            ).then(
                function(ID){
                    alert("成功铸造了新装备:" + NFTname + "\n请刷新装备仓库以查看")
                }
            )
        }
        catch(error){
            alert("已经存在同名NFT!")
        }
        this.setState({isrequesting:false})
    }
    render() {
        if (this.state.isrequesting === true)
            return(
                <h5>正在生成铸币...</h5>
            )
        else return (
            <div>
            <h5>Forge Your Own Item with a Random Rarity!</h5>
            <h6>(from 0 to 100)</h6>
            <h5 className = "text-danger">Lordcoin</h5>
            <input type="text" value={this.state.value} placeholder="item name"
            onChange={(e) => {
                this.setState({
                    value: e.target.value
                });
            }}></input>
            <div style={{marginTop:'30px'}}><h6>You must cost 1000000 wei or more to forge an item.</h6></div>
            <button key="forgew" style={{marginTop:"20px" }} onClick={this.forgeAnNFT}>Forge!</button>
            </div>
        )
    }


}
export default ForgeNFT;