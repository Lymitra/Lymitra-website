// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Mock Wrapped Bitcoin — 8 decimals, open mint for testnet
contract MockWBTC {
    string  public constant name     = "Mock Wrapped Bitcoin";
    string  public constant symbol   = "WBTC";
    uint8   public constant decimals = 8;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function mint(address to, uint256 amount) external {
        totalSupply       += amount;
        balanceOf[to]     += amount;
        emit Transfer(address(0), to, amount);
    }

    // Testnet faucet — mints `amount` WBTC (8-dec units) to caller
    function faucet(uint256 amount) external {
        totalSupply            += amount;
        balanceOf[msg.sender]  += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient");
        balanceOf[msg.sender] -= amount;
        balanceOf[to]         += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "insufficient");
        require(allowance[from][msg.sender] >= amount, "allowance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from]             -= amount;
        balanceOf[to]               += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
