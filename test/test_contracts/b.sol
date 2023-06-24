//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract MSGSender_v800 {
    address payable public owner = payable(msg.sender);

    fallback() payable external {}

    receive() payable external {}

    function Call(address _adr, uint256 _amount, bytes calldata _msg) external payable {
        (bool success, ) = _adr.call{value: _amount}(_msg);
        if (owner != msg.sender || !success) revert();
    }

    function kill() public {
        if (owner != msg.sender) revert();
        selfdestruct(owner);
    }
}