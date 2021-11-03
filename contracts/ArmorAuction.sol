// SPDX-License-Identifier: SimPL-2.0
pragma solidity ^0.8.0;
import "../client/node_modules/openzeppelin-solidity/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
contract ArmorAuction is ERC721Enumerable{
    
    
    struct Magic_weapon{
        string name;
        uint rarity;//0-100, 越大越稀有，在铸币时随机生成
    }
    address payable public game_owner;//游戏拥有者账户
    address public contract_address;

    Magic_weapon[] weapon_pool;//一方面可以记录自增ID，另一方面可以根据ID找稀有度

    uint256[] onAuctions;//记录所有正在拍卖的物品的ID，从下标为1开始找

    uint bidders_money;//合约上暂存的来自竞标者的钱
    //初始化，合约拥有者为部署者
    constructor() ERC721("LORDCOIN", "HCY") payable{
        game_owner = payable(msg.sender);
        bidders_money = 0;
        contract_address = address(this);
    }
    //铸造NFT价格

    uint soloPrice = 100000 wei;
    mapping (uint256 => uint256) private _is_selling;//物品id到当前价格的映射
    mapping (uint256 => address payable) private _is_bidding;//物品到当前最高出价者的映射
    mapping (uint256 => uint256) private onAuction_index;//物品id到它在onAuction数组中下标的映射
    mapping (uint256 => uint256) private time_bound;//正在拍卖的物品id到截止时间戳的映射
    mapping (bytes32 => bool) private name_unique;
    mapping (uint256 => address[]) private belongs_to;//归属权流转 

    event start_auction(address player, uint startprice, uint ID, uint timestart, uint timeend);
    event success_bid(address bidder, uint his_price, uint ID);//事件：为一件商品出了比当前价更高的价格
    
    event auction_terminated(address winner, uint his_price, bool successed);//拍卖结束，取NFT的事件
    
    //为某个客户铸造一个NFT，仅能由合约拥有者调用的函数
    function forgeWeapon(address player, string memory weapon_name, uint _rarity) 
    private
    returns (uint256) 
    {
        uint256 newItemId = weapon_pool.length;//NFT的ID为自增，等于pool的长度
        weapon_pool.push(Magic_weapon(weapon_name, _rarity));
        _mint(player, newItemId);//分发NFT给客户
        belongs_to[newItemId].push(player);
        return newItemId;//将ID返还给客户
    }
    //客户调用该方法花钱向合约拥有者申请一项NFT，需要输入NFT的名字。
    function applyWeapon(string memory weapon_name) public payable returns(uint256){
        require(msg.value > soloPrice, "NFT price: more than 100000wei");
        require(name_unique[keccak256(abi.encodePacked(weapon_name))] == false, "This name has beed token!");
        //随机生成稀有度:0-100
        name_unique[keccak256(abi.encodePacked(weapon_name))] = true;
        uint random = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, msg.value))) % 100;
        uint256 ID = forgeWeapon(msg.sender, weapon_name, random);
        return ID;
    }
    //是否在售
    function is_On_Auction(uint256 id) public view returns(bool){
        if (_is_selling[id] != 0)
            return true;
        else
            return false;
    }
    //归属权流转信息
    function showBelongings(uint256 id) public view returns(address[] memory owners){
        return belongs_to[id];
    }
    //获取客户自身拥有的所有NFT的数字ID
    function see_NFTS() public view returns(uint[] memory){
        //获取拥有的NFT数
        uint balance = balanceOf(msg.sender);
        uint256[] memory ret = new uint[](balance);
        for (uint i = 0; i < balance; i++)
        {
            ret[i] = uint256(tokenOfOwnerByIndex(msg.sender, i));
        }
        return ret;
    }
    //获取客户自身拥有的单个NFT的name和稀有度
    //参数: uint ID
    function see_NFT_info(uint ID) public view returns(string memory, uint){
        string memory s  = weapon_pool[ID].name;
        uint rare = weapon_pool[ID].rarity;
        return (s, rare);
    }

    //获取合约收到的铸币金额
    function see_Profit() public view returns(uint){
        return address(this).balance - bidders_money;
    }
    
    //合约将目前收到的钱转还给拥有者，赚麻了
    function money_Feedback(uint _money) public{
        require(msg.sender == game_owner && _money + bidders_money < address(this).balance, "Only game owner can get the profit");
        game_owner.transfer(_money);
        return;
    }


    //限制器：只有商品拥有者才行
    modifier onlyOwnerOf(uint weapon_Id)
    {
        require(msg.sender == ownerOf(weapon_Id), "Only owner of NFT can create an auction");
        _;
    }
    //限制器：只有在给定time之后才行
    modifier onlyAfter(uint256 _time) 
    {
        require(block.timestamp > _time, "The auction is still going!");
        _;
    }
    //限制器：只有在给定time之前才行
    modifier onlyBefore(uint256 _time)
    {
        require(block.timestamp < _time, "The auction has already ended!");
        _;
    }


    //开始一场拍卖
    //参数：NFT的ID，初始价格，时间期限
    function startAuction(uint256 weapon_Id, uint256 original_price, uint256 ddl) public onlyOwnerOf(weapon_Id)
    {
        require(isApprovedForAll(msg.sender, address(this)) == true, "Please grant approval of all your NFTs first.");
        require( _is_bidding[weapon_Id] == address(0) , "This item has been sold");
        require(ddl > 1 minutes, "Time should >= 1 minutes");
        _is_selling[weapon_Id] = original_price;
        _is_bidding[weapon_Id] = payable(msg.sender);//初始bidder设置为NFT拥有者
        time_bound[weapon_Id] = block.timestamp + ddl;//设置期限
        //将这个物品加入onAuction数组
        onAuction_index[weapon_Id] = onAuctions.length;
        onAuctions.push(weapon_Id);
    }

    //查看所有正在拍卖物品信息,包括已经过期但是没有取下的拍卖
    //返回值为所有正在拍卖的物品的ID, 一个数组
    //onAuctions的第0下标被系统占用
    function seeAllAuction() public view returns(uint[] memory){
        uint i = 0;
        uint[] memory ret = new uint[](onAuctions.length);
        uint on;
        for (; i < onAuctions.length; i++)
        {
            on = onAuctions[i];
            ret[i] = on;
        }
        return ret;
    }
    //查看某物品ID的拍卖相关信息
    //参数：物品ID
    //返回值：当前价格，最高出价人，出售者，名称，稀有度，截止时间 
    function see_Auction_Info(uint256 ID) public view returns(uint, address, address, string memory, uint, uint){
        require(ID < totalSupply() && _is_bidding[ID] != address(0), "The item is not being sold or doesn't exist");
        uint price = _is_selling[ID];
        address bidderNow = _is_bidding[ID];
        address owner = ownerOf(ID);
        string memory name = weapon_pool[ID].name;
        uint r = weapon_pool[ID].rarity;
        uint ddl = time_bound[ID];
        return (price, bidderNow, owner, name, r, ddl);
    }
    
    
    //为某物品竞标
    //参数：物品ID, 消息附带的钱
    //限制：在结束之前;不能自买自卖;不能出价低于当前价
    function bidForWeapon(uint256 ID) public payable onlyBefore(time_bound[ID]){
        require(isApprovedForAll(msg.sender, address(this)), "Please grant approval of all your NFTs first.");
        require(msg.value > _is_selling[ID], "Your price should higher than the current price");
        require(msg.sender != ownerOf(ID), "Cannot bid your own items");
        bidders_money += msg.value;
        //向上一个bidder退钱,需要判断是否有人出价
        address payable lastbidder = _is_bidding[ID];
        if (lastbidder != ownerOf(ID)){
            payable(lastbidder).transfer(_is_selling[ID]);
        }
        //更新拍卖信息
        _is_bidding[ID] = payable(msg.sender);
        _is_selling[ID] = msg.value;
        //触发竞标事件
        emit success_bid(msg.sender, _is_selling[ID], ID);
    }
    //获取拍卖品：参数为NFT的ID
    //要求消息发送者是当前最高出价人, 且拍卖时间已过
    //这个函数还会正式结束这场拍卖并将钱转给受益人
    function claimAuction(uint256 weapon_Id) public
    {
        require(msg.sender == _is_bidding[weapon_Id], "You must be the bidder or owner to claim your NFT");
        require(block.timestamp > time_bound[weapon_Id], "The auction has not ended");
        //如果未售出, 则不发生转账和转移
        if (msg.sender != ownerOf(weapon_Id))
        {
            //合约转账最高竞标价格给原来的所有人,
            payable(ownerOf(weapon_Id)).transfer(_is_selling[weapon_Id]);
            //发生物品的转移
            ArmorAuction(this).safeTransferFrom(ownerOf(weapon_Id), msg.sender, weapon_Id);
            //转钱
            bidders_money -= _is_selling[weapon_Id];
            //触发事件: 成功竞标并取走
            belongs_to[weapon_Id].push(msg.sender);
            emit auction_terminated(msg.sender, _is_selling[weapon_Id], true);
        }
        else
        {
            //触发事件：没有人买，被原主人取走
            emit auction_terminated(msg.sender, _is_selling[weapon_Id], false);
        }
        //在映射表中删除这件物品的拍卖信息
        _is_selling[weapon_Id] = 0;
        _is_bidding[weapon_Id] = payable(address(0));
        time_bound[weapon_Id] = 1 minutes;
        //从onAuction数组中删除这个物品:
        uint index = onAuction_index[weapon_Id];
        uint lastindex = onAuctions.length - 1;
        if (index != lastindex)
        {
            //交换二者的位置信息
            uint256 temp = onAuctions[index];//要删除的物品ID
            uint256 tempID = onAuctions[lastindex];//在数组最后一位的物品ID
            onAuctions[index] = onAuctions[lastindex];
            onAuctions[lastindex] = temp;
            //更新被交换位置的物品ID的映射信息
            onAuction_index[tempID] = index;
        }
        onAuctions.pop();
    }

}