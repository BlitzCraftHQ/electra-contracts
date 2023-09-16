const express = require("express")
const { ethers } = require("ethers")
const { MongoClient } = require("mongodb")
const dotenv = require("dotenv")
dotenv.config()

const GOVERNOR = require("./deployments/althea/GovernorContract.json")
const STATION_REGISTRY = require("./deployments/althea/StationRegistry.json")
const VEHICLE_LEDGER = require("./deployments/althea/VehicleLedger.json")
const ELECTRA_TOKEN = require("./deployments/althea/ElectraToken.json")

const app = express()
const port = 3002

// Initialize your Ethereum provider (e.g., Infura)
const provider = new ethers.providers.JsonRpcProvider("https://althea.zone:8545")
let chainId = 417834
// const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai-bor.publicnode.com');

const client = new MongoClient(process.env.MONGO_URI)
const db = client.db("electra")

// Connect to the contract
const tokenContract = new ethers.Contract(ELECTRA_TOKEN.address, ELECTRA_TOKEN.abi, provider)
const governorContract = new ethers.Contract(GOVERNOR.address, GOVERNOR.abi, provider)
const StationRegistryContract = new ethers.Contract(
  STATION_REGISTRY.address,
  STATION_REGISTRY.abi,
  provider
)
const VehicleLedgerContract = new ethers.Contract(
  VEHICLE_LEDGER.address,
  VEHICLE_LEDGER.abi,
  provider
)

// Start listening to the event
tokenContract.on("*", async (event) => {
  // console.log('Event emitted:');
  console.log(event) // Log the event data
  await db.collection("electra-events").insertOne({ ...event, chainId })
})

governorContract.on("*", async (event) => {
  // console.log('Event emitted:');
  console.log(event) // Log the event data
  await db.collection("electra-events").insertOne({ ...event, chainId })
})

StationRegistryContract.on("*", async (event) => {
  // console.log('Event emitted:');
  console.log(event) // Log the event data
  await db.collection("electra-events").insertOne({ ...event, chainId })
})

VehicleLedgerContract.on("*", async (event) => {
  // console.log('Event emitted:');
  console.log(event) // Log the event data
  await db.collection("electra-events").insertOne({ ...event, chainId })
})

// Start the Express.js server
app.listen(port, () => {
  client.connect().then(() => {
    console.log("Connected successfully to server")
  })
  console.log(`Express server listening on port ${port}`)
})
