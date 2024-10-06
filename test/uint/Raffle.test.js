const { assert } = require("chai");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");
const { getNamedAccounts, deployments, network, ethers } = require("hardhat");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", async function () {
        let raffle, vrfCoordinatorV2Mock, chainId;

        beforeEach(async function(){
            const { deployer } = await getNamedAccounts()
            await deployments.fixture("all") // deploying everything
        
            // // Correcting case sensitivity issue
            // raffle = await ethers.getContractAt("Raffle", deployer)
            // vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", deployer) // corrected artifact name
            // chainId = network.config.chainId;
            // // console.log("Raffle Contract:", raffle);

            const vrfCoordinatorV2MockDepolyed = await deployments.get("VRFCoordinatorV2Mock")
            vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock",vrfCoordinatorV2MockDepolyed.address)
            const raffleDeployed = await deployments.get("Raffle")
            raffle = await ethers.getContractAt("Raffle", raffleDeployed.address)
            console.log(raffle)

        })
        

        describe("Constructor", async function () {
            it("initializes the raffle correctly", async function () {
                // const raffleState = await raffle.getRaffleState();
                const interval = await raffle.getInterval();
                // assert.equal(raffleState.toString(), "0");
                // assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
            });
        });
    });
