// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
 
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ElectraToken.sol";
import "./StationRegistry.sol";

contract VehicleLedger is Ownable{  
    ElectraToken public electraToken; // Address of the ElectraTokens contract
    StationRegistry public stationRegistry; // Address of the StationRegistry contract

    // Struct to represent a vehicle
    struct Vehicle {
        string vin;       // Vehicle Identification Number (Primary ID)
        string metadata;  // Metadata URI 
        uint256 balance;  // Balance of the vehicle
    }

    // Mapping to store vehicles using their VIN as the key
    mapping(string => Vehicle) private vehicleRegistry; 

    event VehicleRegistered(
        string vin,
        string metadata,
        uint256 blockNumber
    );

    event VehicleCharged(
        string vin,
        uint256 amount,
        uint256 blockNumber
    );

    constructor(address _electraTokenAddress, address _stationRegistryAddress) {
        electraToken = ElectraToken(_electraTokenAddress);   
        stationRegistry = StationRegistry(_stationRegistryAddress);
    }

    // Function to register a new vehicle
    function registerVehicle(string memory _vin, string memory _metadata) public  {
        // Check if vehicle already exists
        require(bytes(vehicleRegistry[_vin].vin).length == 0, "VIN already exists");
        vehicleRegistry[_vin] = Vehicle(_vin, _metadata, 0);
        emit VehicleRegistered(_vin, _metadata, block.number);
    }  

    // Function to top up a vehicle's balance
    function topUpBalance(string memory _vin) public payable returns (uint256) {

        // Check if vehicle exists
        Vehicle storage vehicle = vehicleRegistry[_vin];
        require(bytes(vehicle.vin).length != 0, "Vehicle with this VIN does not exist");

        // Check if the amount sent is greater than 0
        require(msg.value > 0, "Amount must be greater than 0");
        
        // Collect _amount tokens from the sender
        uint256 _amount = msg.value;
        
        // Update the vehicle's balance
        vehicle.balance += _amount;

        return vehicle.balance;
    }

    // Function to transfer funds from one vehicle to another
    function chargeVehicle(uint256 _stationId, string memory _vin) public returns (uint256) {
        // Check if vehicle exists
        Vehicle storage vehicle = vehicleRegistry[_vin];
        require(bytes(vehicle.vin).length != 0, "VIN does not exist");

        // Get station charging fee
        uint256 chargingFee = stationRegistry.getChargingFee(_stationId);
        require(vehicle.balance >= chargingFee, "Insufficient balance");

        // Get owner
        address payable stationOwner = payable(stationRegistry.getStationOwner(_stationId));

        // Transfer funds from vehicle to station 
        stationOwner.transfer(chargingFee);
        vehicle.balance -= stationRegistry.listingFee();

        emit VehicleCharged(_vin, vehicle.balance, block.number);

        return vehicle.balance;
    }

    // View function to get the balance of a specific vehicle
    function getBalance(string memory _vin) public view returns (uint256) {
        return vehicleRegistry[_vin].balance;
    }

    function getVehicle(string memory _vin) public view returns (Vehicle memory) {
        return vehicleRegistry[_vin];
    }
}