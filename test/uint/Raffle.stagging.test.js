const { assert, expect } = require("chai");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");
const { getNamedAccounts, deployments, network, ethers } = require("hardhat");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", async function () {
        let raffle, raffleEntraceFee, deployer, interval;

        beforeEach(async function(){
            deployer = (await getNamedAccounts()).deployer
            raffle = await ethers.getContractAt("Raffle", deployer)
            raffleEntraceFee = await raffle.getEntranceFee();
        })

        describe("fulfillRandomWords", function(){
            it("works with live chainlink keepers and chainlink VRK, we get a random", async function(){
                // enter the raffle
                const startingTimeStamp = await raffle.getLatestTimeStamp();
                const accounts = await ethers.getSigners();

                //set up listener before we enter the raffle
                // just in case the blochcain moves REALLY fast
                await new Promise(async (resolve, reject)=>{
                    raffle.once("WinnerPicked", async()=>{
                        console.log("WinnerPicked event fired!")
                        resolve()
                        try {
                            const recentWinner = await raffle.getRecentWinner()
                            const raffleState = await raffle.getRaffleState()
                            const winnerEndingBalance = await accounts[0].getBalance()
                            const endingTimeStamp = await raffle.getLastTomeStamp();

                            await expect(raffle.getPlayer((0))).to.be.reverted
                            assert.equal(recentWinner.toString(), accounts[0].address)
                            assert.equal(raffleWinner.toString(), accounts[0].address)
                            assert.equal(
                                winnerEndingBalance.toString(),
                                winnerStartingBalance.add(raffleEntraceFee).toString()
                            )
                            assert(endingTimeStamp>startingTimeStamp)
                            resolve()
                        } catch (e) {
                            console.log(e)
                            reject(e)
                        }
                    })

                    await raffle.enterRaffle({value: raffleEntraceFee})
                    const winnerStartingBalance = await accounts[0].getBalance()

                })


            })
        })
})