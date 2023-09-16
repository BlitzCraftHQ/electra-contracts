// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract ElectraToken is ERC20Votes {
  uint256 public s_maxSupply = 1000000000000000000000000;

  constructor() ERC20("ElectraToken", "ELCT") ERC20Permit("ElectraToken") {
    _mint(msg.sender, s_maxSupply/2);
    _mint(address(this), s_maxSupply/2);
  }

  function stake(address to, uint256 amount) public {
    _transfer(address(this), to, amount);
    delegate(to);
  }
  
  // The functions below are overrides required by Solidity. 
  function _afterTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal override(ERC20Votes) {
    super._afterTokenTransfer(from, to, amount);
  }

  function _mint(address to, uint256 amount) internal override(ERC20Votes) {
    super._mint(to, amount);
  }

  function _burn(address account, uint256 amount) internal override(ERC20Votes) {
    super._burn(account, amount);
  }
}
