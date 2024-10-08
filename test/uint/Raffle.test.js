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
                await expect(raffle.enterRaffle({value: raffleEntraceFee})).to.be.revertedWith("Raffle__NotOpen")
            })
        })

        describe("checkUpKeep", async function(){
            it("returns false if people haven't sent any ETH", async function(){
                await network.provider.send("evm_increaseTime", [interval.toNumber()+1])
                await network.provider.send("evm_mine", [])
                const {upKeepNeeded} = await raffle.callStatic.checkUpkeep([])
                assert(!upKeepNeeded)
            })
            it("returns false if raffle isn't open", async function(){
                await raffle.enterRaffle({value: raffleEntraceFee})
                await network.provider.send("evm_increaseTime", [interval.toNumber()+1])
                await network.provider.send("evm_mine", [])
                await raffle.performUpkeep([])
                const raffleState = await raffle.getRaffleState()
                const {upkeepNeeded} = await raffle.callStatic.checkUpkeep([])
                assert.equal(raffleState.toString(), "1")
                assert.equal(upkeepNeeded,false)
            })
            it("returns false if enough time hasn't passed", async () => {
                await raffle.enterRaffle({ value: raffleEntraceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]) // use a higher number here if this test fails
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert(!upkeepNeeded)
            })
            it("returns true if enough time has passed, has players, eth, and is open", async () => {
                await raffle.enterRaffle({ value: raffleEntraceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert(upkeepNeeded)
            })
        })

        describe("performUpKeep", function(){
            it("it can only run if checkUpLeep is true", async function(){
                await raffle.enterRaffle({value: raffleEntraceFee})
                await network.provider.send("evm_increaseTime", [interval.toNumber()+1])
                await network.provider.send("evm_mine", [])
                const tx = await raffle.performUpkeep([])
                assert(tx)
            })
            it("reverst when checkupkep is false", async function(){
                await expect(raffle.performUpkeep([])).to.be.revertedWith(
                    "Raffle__UpkeepNotNeeded"
                )
            })
            it("updates the raffle state, emits and event and calls the vrf coordinator", async function(){
                await raffle.enterRaffle({value: raffleEntraceFee})
                await network.provider.send("evm_increaseTime", [interval.toNumber()+1])
                await network.provider.send("evm_mine", [])
                const txResponse = await raffle.performUpkeep([])
                const txReceipt = await txResponse.wait(1)
                const requestId = txReceipt.events[1].args.requestId
                const raffleState = await raffle.getRaffleState()
                assert(requestId.toNumber()>0)
                assert(raffleState==1)
            })
        })

        describe("fulfillRandomeWords", function(){
            beforeEach(async function(){
                await raffle.enterRaffle({value: raffleEntraceFee})
                await network.provider.send("evm_increaseTime", [interval.toNumber()+1])
                await network.provider.send("evm_mine", [])
            })
            it("can only be called be after perfomUpkeep", async function(){
                await expect(
                    vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
                ).to.be.revertedWith("nonexistent request")
                await expect(
                    vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
                ).to.be.revertedWith("nonexistent request")
            })
            it("picks a winner, rests the lottery, and sends money", async function(){
                const additionalentrants = 3;
                const startingAccountIndex = 1;
                const accounts = await ethers.getSigners()
                for(let i=startingAccountIndex; i<startingAccountIndex+additionalentrants; i++){
                    const accountConnectedRaffle = raffle.connect(accounts[i])
                    await accountConnectedRaffle.enterRaffle({value: raffleEntraceFee})
                }
                const startingTimeStamp = await raffle.getLastTimeStamp();
                const winnerStartingBalance = await accounts[1].getBalance()

                await new Promise(async (resolve, reject)=>{
                    raffle.once("WinnerPicked", async ()=>{
                        console.log("Found the event")
                        try {
                            const recentWinner = await raffle.getRecentWinner()
                            console.log(recentWinner)
                            console.log()
                            console.log(accounts[0].address)
                            console.log(accounts[1].address)
                            console.log(accounts[2].address)
                            console.log(accounts[3].address)
                            const raffleState = await raffle.getRaffleState()
                            const endingTimeStamp = await raffle.getLastTimeStamp()
                            const numPlayer = await raffle.getNumberOfPlayeres()
                            assert.equal(numPlayer.toString(), "0")
                            assert.equal(raffleState.toString(), "0")
                            assert(endingTimeStamp > startingTimeStamp)
                            const winerEndingBalance = await accounts[1].getBalance()

                            assert(winerEndingBalance.toString(), winnerStartingBalance.add(raffleEntraceFee.mul(additionalentrants).add(raffleEntraceFee).toString()))
                        } catch (e) {
                            reject(e)
                        }
                        resolve()
                    })
                    const tx = await raffle.performUpkeep([])
                    const txReceipt = await tx.wait(1)
                    await vrfCoordinatorV2Mock.fulfillRandomWords(
                        txReceipt.events[1].args.requestId,
                        raffle.address
                    )  //this function will emit WinnerPicked
                    
                })

            })
        })



    });
