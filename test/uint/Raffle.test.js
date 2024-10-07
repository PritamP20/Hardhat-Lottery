const { assert, expect } = require("chai");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");
const { getNamedAccounts, deployments, network, ethers } = require("hardhat");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", async function () {
        let raffle, vrfCoordinatorV2Mock, chainId, raffleEntraceFee, deployer, interval;

        beforeEach(async function(){
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture("all") // deploying everything
        
            // // Correcting case sensitivity issue
            // raffle = await ethers.getContractAt("Raffle", deployer)
            // vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", deployer) // corrected artifact name
            chainId = network.config.chainId;
            // // console.log("Raffle Contract:", raffle);

            const vrfCoordinatorV2MockDepolyed = await deployments.get("VRFCoordinatorV2Mock")
            vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock",vrfCoordinatorV2MockDepolyed.address)
            const raffleDeployed = await deployments.get("Raffle")
            raffle = await ethers.getContractAt("Raffle", raffleDeployed.address)
            // console.log(raffle)

            raffleEntraceFee = await raffle.getEntranceFee();
            interval = await raffle.getInterval();

        })
        

        describe("Constructor", async function () {
            it("initializes the raffle correctly", async function () {
                const raffleState = await raffle.getRaffleState();
                assert.equal(raffleState.toString(), "0");
                assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
            });
        });

        describe("enterRaffle", async function (){
            it("reverst when you don't pay enough", async function(){
                await expect(raffle.enterRaffle()).to.be.revertedWith(
                    "Raffle__NotEnoughEthEntered"
                )
            })
            it("revords players when they enter", async function(){
                await raffle.enterRaffle({value: raffleEntraceFee})
                const rafflePlayer = await raffle.getPlayer(0);
                assert.equal(rafflePlayer, deployer)
            })
            it("emits event on enter", async function(){
                await expect(raffle.enterRaffle({value: raffleEntraceFee})).to.emit(
                    raffle,
                    "RaffleEvent"
                )
            })
            it("doesnt allow entrance when raffle is calculating", async function(){
                await raffle.enterRaffle({value: raffleEntraceFee});
                await network.provider.send("evm_increaseTime", [interval.toNumber()+1])
                await network.provider.send("evm_mine", [])
                await raffle.performUpkeep([])
                // await expect(raffle.enterRaffle({value: raffleEntraceFee})).to.be.revertedWith("Raffle__NotOpen")
                const raffleState = await raffle.getRaffleState().toString()
                expect(raffleState).to.be.equal("1")
            })
        })
    });
