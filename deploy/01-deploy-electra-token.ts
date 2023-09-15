import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const deployElectraToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  log("----------------------------------------------------")
  log("Deploying ElectraToken and waiting for confirmations...")
  const electraToken = await deploy("ElectraToken", {
    from: deployer,
    args: [],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name]?.blockConfirmations || 1,
  })
  log(`ElectraToken at ${electraToken.address}`)
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(electraToken.address, [])
  }
  log(`Delegating to ${deployer}`)
  await delegate(electraToken.address, deployer)
  log("Delegated!")
}

const delegate = async (electraTokenAddress: string, delegatedAccount: string) => {
  const electraToken = await ethers.getContractAt("ElectraToken", electraTokenAddress)
  const transactionResponse = await electraToken.delegate(delegatedAccount)
  await transactionResponse.wait(1)
  console.log(`Checkpoints: ${await electraToken.numCheckpoints(delegatedAccount)}`)
}

export default deployElectraToken
deployElectraToken.tags = ["all", "electra-token"]
