const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("1");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts(); // Ensure this line is correct
    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock;
    const chainId = network.config.chainId;

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2MockDeployment = await deployments.get("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Mock = await ethers.getContractAt(
            "VRFCoordinatorV2Mock",
            vrfCoordinatorV2MockDeployment.address
        );
        vrfCoordinatorV2Address = vrfCoordinatorV2MockDeployment.address;

        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
        const transactionReceipt = await transactionResponse.wait(1);
        subscriptionId = transactionReceipt.events[0].args.subId;

        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);

       
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinator"];
        subscriptionId = networkConfig[chainId]["subscriptionId"];
    }

    const entranceFee = networkConfig[chainId]["entranceFee"];
    const gasLane = networkConfig[chainId]["gasLane"];
    const callBackGasLimit = networkConfig[chainId]["callBackGasLimit"];
    const interval = networkConfig[chainId]["interval"];

    const args = [vrfCoordinatorV2Address, entranceFee, gasLane, subscriptionId,  callBackGasLimit, interval];

    console.log("Deployer Address:", deployer);
console.log("VRF Coordinator Address:", vrfCoordinatorV2Address);
console.log("Subscription ID:", subscriptionId);
console.log("Arguments for Raffle:", args);


    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address);
    // log('Consumer is added');

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying....");
        await verify(raffle.address, args);
    }
    log("------------------------------");
};

module.exports.tags = ["all", "raffle"];
