// Raffle

// Enter the lottery (paying some amount)
// Pick a random winner (verifiable random)
// Winner to be selected every X minutes -> completly automate
// chainlink oracle -> Randomness, Automated Execution (Chainlink keeper)

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chinlink/contracts/src/v0.8/VRFConsumerBaseV2.sol"

error Raffle__NotEnoughEthEntered();

contract Raffle {
    /* State variables */
    uint256 private immutable i_enteraceFee;
    address payable[] private s_players;

    constructor(uint256 entraceFee) {
        i_enteraceFee = entraceFee;
    }

    /* Events */
    event RaffleEvent(address indexed payer );

    uint256 private s_entranceFee

    function enterRaffle() public payable returns () {
        if(msg.value < i_enteraceFee){
            revert Raffle__NotEnoughEthEntered();
        }
        // s_players.push(msg.sender) this wont work bcz msg.sender is not a payable address
        s_players.push(payable(msg.sender));

        //Emit an event when we update a dynamic arrat or mapping
        emit RaffleEvent(msg.sender)
        
    }

    function requestRandomWinner() external returns () {
        
    }

    function fullfillRandomWords() internal override returns () {
        
    }

    function getEntranceFee() public view returns () {
        return i_enteraceFee;
    }

    function getPlayer(uint256 index) public view returns () {
        return s_players[index]
    }
}