import React, { Component } from "react";

let web3 = require("./getWeb3")
let auctionApp = require("./Instance")
let items = [];
let list = [];
let onShelf = []
let rarity = []
let name = []
class MyItems extends Component{
    state = { isReloading: false }

    //只执行一次的初始化,在render之后
    componentDidMount = async() => {
        await this.Refresh().then(
            this.setState({isReloading: false})
        )
    }
    
    //刷新按钮绑定事件
    Refresh = async() => {
        if (this.state.isReloading === true){
            alert("正在刷新请稍等");
            return;
        }
        //检查并更改默认账户
        this.setState({isReloading: true})
        await web3.eth.getAccounts().then(
            function(accounts){
                web3.eth.defaultAccount = accounts[0]
            }
        );
        items = [];
        items = await auctionApp.methods.see_NFTS().call(
            {from: web3.eth.defaultAccount}
        ).then(
            // console.log
            function(items){
                var k = 0
                list = []
                for (var i in items)
                {
                    list[k] = items[k]
                    k++
                }
                
            }
        );
        
        await this.getDetail(list).then()
        
    }

    
    DataList(data) {
        return (
            <table id="myItemsTable" scroll={{x:4}} style={{border:1,width:"100%"}}>
                
                <tbody>
                <tr>
                <th>编号</th>
                <th>名称</th>
                <th>稀有度</th>
                <th>状态</th>
                </tr>
                {
                    data.map(function (value, key) {
                        return (
                            <tr key={key}>
                                <td key={value}>{value}</td>
                                <td key={name[key]}>{name[key]}</td>
                                <td key={value + name[key]}>{rarity[key]}</td>
                                <td key={value + onShelf[key]}>{onShelf[key]}</td>
                            </tr>
                        )
                    })
                }

                </tbody>
              </table>
        )
    }
    //传入:NFT编号数组
    //作用:将这些NFT的detail写入name和rarity数组中
    getDetail = async(list) => {

        for (var i = 0; i < list.length; i++)
        {
            await auctionApp.methods.see_NFT_info(list[i]).call().then(
                function(x){
                    name[i] = x[0];
                    rarity[i] = x[1];
                }
            )
            await auctionApp.methods.is_On_Auction(list[i]).call().then(
                function(c){
                    onShelf[i] = "库存中"
                    if (c === true)
                        onShelf[i] = "上架中"
                }
            )
        }
        this.setState({isReloading: false})
    }

    render(){
        if (this.state.isReloading === true)
            return(
                <h1>正在加载...</h1>
            )
        return(
        <div>
            <button id = "flashNFTS" onClick={this.Refresh} >refresh</button>
            <h3 style={{textAlign: 'center'}}>My Lordcoins</h3>
            <div>
                {this.DataList(list)}
            </div>
        </div>
        );
    }
}


export default MyItems