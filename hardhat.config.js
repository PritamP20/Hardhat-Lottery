/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

module.exports = {
  defaultNetwork: "hardhat",
  networks:{
    hardhat:{
      chainId: 31337,
      blockConfirmations: 1
    },
    sepolia: {
      chainId: 11155111,
      url: "https://eth-sepolia.g.alchemy.com/v2/dDJJ1Lvt2Xyuac8UgD3xAcQekhHqtI-P",
      accounts: ["8b87d9854e35388b8f6d9ffba30c5316958e89fdae04326d914f411b463d4b08"],
      blockConfirmations: 6
    }
  },
  solidity: "0.8.27",
  namedAccounts:{
    deployer:{
      default: 0
    },
    player:{
      default: 1,
    },
  }
};
