const { ethers } = require("hardhat");

const networkConfig = {
  11155111: {
      name: "sepolia",
      vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625", //got this from chainlink
      entranceFee: ethers.utils.parseEther("0.01"),
      gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", //same from chinlink
      subscriptionId: "69689304211938740301763523167737208755572062542437894034494210773096442095917",
      callBackGasLimit: "500000",
      interval: "30"
    },
    31337:{
        name: "hardhat",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        callBackGasLimit: "500000",
        interval: "30"
    }
  };

const developmentChains = ["hardhat", "localhost"];

module.exports={
    networkConfig,
    developmentChains
}