// SPDX-License-Identifier: UNLICESED
pragma solidity ^0.8.20;

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract DvDManager {
    
    event DVDTransferInitiated(
        bytes32 indexed transferID,
        address maker,
        address indexed token1,
        uint256 token1Amount,
        address taker,
        address indexed token2,
        uint256 token2Amount);

    event DVDTransferExecuted(bytes32 indexed transferID);

    event DVDTransferCancelled(bytes32 indexed transferID);

        struct Delivery {
        address counterpart;
        address token;
        uint256 amount;
    }

    uint256 public txNonce;
    mapping(bytes32 => Delivery) public token1ToDeliver;
    mapping(bytes32 => Delivery) public token2ToDeliver;
    address owner;

    constructor () {
        owner = msg.sender;
    }

    function initiateDVDTransfer(
        address _token1,
        uint256 _token1Amount,
        address _counterpart,
        address _token2,
        uint256 _token2Amount) external {
        require(IERC20(_token1).balanceOf(msg.sender) >= _token1Amount, "Not enough tokens in balance");
        require(
            IERC20(_token1).allowance(msg.sender, address(this)) >= _token1Amount
            , "not enough allowance to initiate transfer");
        require (_counterpart != address(0), "counterpart cannot be null");
        require(IERC20(_token2).totalSupply() != 0, "invalid address : address is not an ERC20");
        Delivery memory token1;
        token1.counterpart = msg.sender;
        token1.token = _token1;
        token1.amount = _token1Amount;
        Delivery memory token2;
        token2.counterpart = _counterpart;
        token2.token = _token2;
        token2.amount = _token2Amount;
        bytes32 transferID =
        calculateTransferID(
                txNonce,
                token1.counterpart,
                token1.token,
                token1.amount,
                token2.counterpart,
                token2.token,
                token2.amount);
        token1ToDeliver[transferID] = token1;
        token2ToDeliver[transferID] = token2;
        emit DVDTransferInitiated(
                transferID,
                token1.counterpart,
                token1.token,
                token1.amount,
                token2.counterpart,
                token2.token,
                token2.amount);
        txNonce++;
    }

    function takeDVDTransfer(bytes32 _transferID) external {
        Delivery memory token1 = token1ToDeliver[_transferID];
        Delivery memory token2 = token2ToDeliver[_transferID];
        require(
            token1.counterpart != address(0) && token2.counterpart != address(0)
            , "transfer ID does not exist");
        IERC20 token1Contract = IERC20(token1.token);
        IERC20 token2Contract = IERC20(token2.token);
        require (
            msg.sender == token2.counterpart
            , "transfer has to be done by the counterpart or by owner");
        require(
            token2Contract.balanceOf(token2.counterpart) >= token2.amount
            , "Not enough tokens in balance");
        require(
            token2Contract.allowance(token2.counterpart, address(this)) >= token2.amount
            , "not enough allowance to transfer");

        token1Contract.transferFrom(token1.counterpart, token2.counterpart, token1.amount);
        token2Contract.transferFrom(token2.counterpart, token1.counterpart, token2.amount);
        delete token1ToDeliver[_transferID];
        delete token2ToDeliver[_transferID];
        emit DVDTransferExecuted(_transferID);
    }

    function cancelDVDTransfer(bytes32 _transferID) external {
        Delivery memory token1 = token1ToDeliver[_transferID];
        Delivery memory token2 = token2ToDeliver[_transferID];
        require(token1.counterpart != address(0) && token2.counterpart != address(0), "transfer ID does not exist");
        require (
            msg.sender == token2.counterpart ||
            msg.sender == token1.counterpart ||
            msg.sender == owner
            , "you are not allowed to cancel this transfer");
        delete token1ToDeliver[_transferID];
        delete token2ToDeliver[_transferID];
        emit DVDTransferCancelled(_transferID);
    }

    function calculateTransferID (
        uint256 _nonce,
        address _maker,
        address _token1,
        uint256 _token1Amount,
        address _taker,
        address _token2,
        uint256 _token2Amount
    ) public pure returns (bytes32){
        bytes32 transferID = keccak256(abi.encode(
                _nonce, _maker, _token1, _token1Amount, _taker, _token2, _token2Amount
            ));
        return transferID;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "onlyOwner");
        _;
    }
}