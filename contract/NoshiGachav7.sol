// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lottery {
    address public manager;
    address payable[] public participants;
    address payable public winner;
    uint public winnings;

    event WinnerSelected(address winner, unit winnings);

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > .01 ether, "Minimum 0.01 ETH required to enter");

        participants.push(payable(msg.sender));
    }

    function random() private view returns (uint) {
        return
            uint(
                keccak256(
                    abi.encodePacked(
                        blockhash(block.number - 1),
                        block.timestamp,
                        participants
                    )
                )
            );
    }

    function pickWinner() public restricted {
        require(msg.sender == manager, "Only the manager can pick a winner");
        require(participants.length > 0, "Not enough participants");

        uint index = random() % participants.length;
        address payable winner = participants[index];
        winner.transfer((address(this).balance * 75) / 100);
        payable(manager).transfer(address(this).balance);
        uint winnings = ((address(this).balance * 75) / 100);

        /*
function pickWinner() public payable OnlyOwnerormanager {
    require(participants.length > 0, "No participants in the lottery");
    uint index = random() % participants.length;
    address payable winner = participants[index];
    address payable winnerAddress = payable(winner);
    winner.transfer((address(this).balance * 75) / 100);
    payable(manager).transfer(address(this).balance);
    uint winnings = ((address(this).balance * 75) / 100);
        */

        // Emit an event with the winner's address
        emit WinnerSelected(winner, winnings);

        // Reset the lottery for the next round
        participants = new address payable[](0);
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function getParticipants() public view returns (address payable[] memory) {
        return participants;
    }
}
