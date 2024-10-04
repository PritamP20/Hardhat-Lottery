const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");

module.exports = async function ({getNamedAccounts, deployments}){
    const {deploy, log} = deployments;
    const {deployer} = getNamedAccounts();
    let vrfCoordinatorV2Address;
    const chainId = network.config.chainId

    if(developmentChains.includes(network.name)){
        const vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock;
    }else{
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoodinatorV2"]
    }

    const entranceFee = networkConfig[chainId]["entranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    
    const args = [vrfCoordinatorV2Address, entranceFee, gasLane]

    const raffle = await deploy("Raffle",{
        from: deployer,
        args: [],
        log: true,
        waitConfirmatinos: network.config.blockConfirmations || 1,
    })
}