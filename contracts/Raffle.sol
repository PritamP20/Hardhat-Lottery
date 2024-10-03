// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

error Raffle__NotEnoughEthEntered();
error Raffle_TransferFailed();

contract Raffle is VRFConsumerBaseV2 {
    /* State variables */
    uint256 private immutable i_enteranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint16 private constant REQUEST_CONFERMATIONS = 3;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;

    //Lottery Variables
    address private recentWinner;

    /* Events */
    event RaffleEvent(address indexed player);
    event RequestRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    constructor(address vrfCoordinatorV2, uint256 entranceFee, bytes32 gaslane, uint64 subscriptionId, uint32 callbackGasLimit) 
        VRFConsumerBaseV2(vrfCoordinatorV2)
    {
        i_enteranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gaslane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
    }

    function enterRaffle() public payable {
        if (msg.value < i_enteranceFee) {
            revert Raffle__NotEnoughEthEntered();
        }
        s_players.push(payable(msg.sender));

        emit RaffleEvent(msg.sender);
    }

    function requestRandomWinner() external {
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFERMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestRaffleWinner(requestId);
    }

    function fulfillRandomWords(uint256 /*requestId*/, uint256[] memory randomWords) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable r_recentWinner = s_players[indexOfWinner];
        recentWinner = r_recentWinner;
        (bool success, ) = r_recentWinner.call{value: address(this).balance}("");
        if(!success){
            revert Raffle_TransferFailed();
        }
        emit WinnerPicked(r_recentWinner);

    }

    function getEntranceFee() public view returns (uint256) {
        return i_enteranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }
}
