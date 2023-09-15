// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ElectraToken.sol";

contract StationRegistry is Ownable { 
    using Counters for Counters.Counter;
     ElectraToken public electraToken; // Address of the ElectraTokens contract


    Counters.Counter public _stationIdCounter;
    uint256 public listingFee; // Fee required to add a station
 
    struct ChargingStation {
        address owner; 
        string metadata; 
        uint256 stationId;
        uint256 chargingFee;
    }

    mapping(uint256 => ChargingStation) public chargingStationsRegistry;

    event ChargingStationAdded(
        address owner, 
        string metadata, 
        uint256 stationId,
        uint256 chargingFee
    ); 

    event ChargingStationRemoved(
        uint256 stationId
    );

    constructor(uint256 _listingFee) {
        listingFee = _listingFee; 
    }    

    function addChargingStation(address _owner, string memory _metadata, uint256 _chargingFee) external payable onlyOwner returns (uint256) {
        // require(msg.value >= listingFee, "Insufficient listing fee");
        _stationIdCounter.increment();
        uint256 _stationId = _stationIdCounter.current();
        chargingStationsRegistry[_stationId] = ChargingStation({
            owner: _owner, 
            metadata: _metadata, 
            stationId: _stationId,
            chargingFee: _chargingFee
        });
        emit ChargingStationAdded(
            _owner, 
            _metadata, 
            _stationId,
            _chargingFee
        );
        return _stationId;
    } 

    function getChargingFee(uint256 _stationId) external view returns (uint256) {
        return chargingStationsRegistry[_stationId].chargingFee;
    }

    function getStationOwner(uint256 _stationId) external view returns (address) {
        return chargingStationsRegistry[_stationId].owner;
    }

    function getStation(uint256 _stationId) external view returns (ChargingStation memory) {
        return chargingStationsRegistry[_stationId];
    }

    function removeChargingStation(uint256 _stationId) external onlyOwner {
        require(chargingStationsRegistry[_stationId].owner != address(0), "Station does not exist");
        delete chargingStationsRegistry[_stationId];
        emit ChargingStationRemoved(_stationId);
    } 
}
