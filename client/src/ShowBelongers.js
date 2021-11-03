import React, { Component } from "react";
let auctionApp = require("./Instance")
let list = []
class ShowBelongers extends Component{
    state = { isrequesting: false, valueID:""}

    checkBelongings = async() => {
        this.setState({isrequesting:true})
        let ID = this.state.valueID
        list = [];
        if (ID === ""){
            alert("请输入正确的编号!")
            this.setState({isrequesting:false})
            return
        }
        try{
            await auctionApp.methods.showBelongings(ID).call().then(
                function(ret){
                    list = ret
                }
            )   
        }
        catch(error){
            alert("该NFT序号不存在!")
            this.setState({isrequesting:false})
            return
        }
        this.setState({isrequesting:false})
    }

    render(){
        if (this.state.isrequesting)
            return(<b>正在查询,请稍等</b>)
        else return(
            <div>
                <div className="form-group"> 
                <h1>Check An NFT's past owners</h1>
                <input type="number" className="form-control" placeholder="ID" key="inputID"
                    onChange={(e) => {
                        this.setState({
                            valueID: e.target.value
                        });
                    }}/> </div>
                <button type="button" className="btn btn-primary" id="bidFor" onClick={this.checkBelongings}>Check</button>
                <table id="BelongingsTable" scroll={{x:4}} style={{border:1,width:"100%"}}>
                <tbody>
                <tr>
                <th>次序</th>
                <th>归属人(按时间顺序)</th>
                </tr>
                {
                    list.map(function (value, key) {
                        return (
                            <tr key={key}>
                                <td key={1+value}>{key}</td>
                                <td key={key+value}>{value}</td>
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
export default ShowBelongers