//SPDX-License-Identifier: UNLICENSED

pragma solidity 0.4.26;

contract MSGSender_v426 {
    address owner = msg.sender;

    function() external payable{}

    modifier onlyOwner() {
        if (owner != msg.sender) revert();
        _;
    }

    function Call(address _adr, uint256 _amount, bytes _msg) external payable onlyOwner {
        bool success = _adr.call.value(_amount)(_msg);
        if (!success) revert();
    }

    function kill() external payable onlyOwner{
        selfdestruct(msg.sender);
    }
}
