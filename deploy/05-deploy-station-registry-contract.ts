import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import { ethers } from "hardhat"
import { parseEther } from "ethers/lib/utils"

const deployStationRegistry: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  log("----------------------------------------------------")
  log("Deploying Station Registry and waiting for confirmations...")
  const stationRegistry = await deploy("StationRegistry", {
    from: deployer,
    args: [
      parseEther("0.0001"), // 0.0001 ETH -> 100000000000000 wei
    ],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name]?.blockConfirmations || 1,
  })
  log(`StationRegistry at ${stationRegistry.address}`)
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(stationRegistry.address, [])
  }
  const stationRegistryContract = await ethers.getContractAt(
    "StationRegistry",
    stationRegistry.address
  )
  const timeLock = await ethers.getContract("TimeLock")
  const transferTx = await stationRegistryContract.transferOwnership(timeLock.address)
  await transferTx.wait(1)
}

export default deployStationRegistry
deployStationRegistry.tags = ["all", "station-registry"]
