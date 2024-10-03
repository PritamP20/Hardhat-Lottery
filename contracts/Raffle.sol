// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

error Raffle__NotEnoughEthEntered();

contract Raffle is VRFConsumerBaseV2 {
    /* State variables */
    uint256 private immutable i_enteranceFee;
    address payable[] private s_players;

    /* Events */
    event RaffleEvent(address indexed payer);

    constructor(address vrfCoordinator, uint256 entranceFee) 
        VRFConsumerBaseV2(vrfCoordinator)
    {
        i_enteranceFee = entranceFee;
    }

    function enterRaffle() public payable {
        if (msg.value < i_enteranceFee) {
            revert Raffle__NotEnoughEthEntered();
        }
        s_players.push(payable(msg.sender));

        emit RaffleEvent(msg.sender);
    }

    function requestRandomWinner() external {
        
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        
    }

    function getEntranceFee() public view returns (uint256) {
        return i_enteranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }
}
