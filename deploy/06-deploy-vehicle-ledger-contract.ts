import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const deployVehicleLedger: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const electraToken = await get("ElectraToken")
  const stationRegistry = await get("StationRegistry")

  log("----------------------------------------------------")
  log("Deploying VehicleLedger and waiting for confirmations...")
  const vehicleLedger = await deploy("VehicleLedger", {
    from: deployer,
    args: [electraToken.address, stationRegistry.address],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name]?.blockConfirmations || 1,
  })
  log(`VehicleLedger at ${vehicleLedger.address}`)
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(vehicleLedger.address, [])
  }
  const stationRegistryContract = await ethers.getContractAt("VehicleLedger", vehicleLedger.address)
  const timeLock = await ethers.getContract("TimeLock")
  const transferTx = await stationRegistryContract.transferOwnership(timeLock.address)
  await transferTx.wait(1)
}

export default deployVehicleLedger
deployVehicleLedger.tags = ["all", "vehicle-ledger"]
