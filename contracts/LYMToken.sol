// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * LYMToken — Lymitra platform reward token.
 *
 * Earned by running payroll: 1 LYM per employee paid per cycle.
 * Only the registered minter (the vault) can mint new tokens.
 * Standard ERC-20 — transferable, tradeable, stakeable.
 */
contract LYMToken {
    string  public constant name     = "Lymitra Rewards";
    string  public constant symbol   = "LYM";
    uint8   public constant decimals = 18;

    address public owner;
    address public minter; // set to vault after deploy

    uint256 public totalSupply;
    mapping(address => uint256)                     public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner_, address indexed spender, uint256 value);
    event MinterSet(address indexed minter_);

    modifier onlyOwner()  { require(msg.sender == owner,  "not owner");  _; }
    modifier onlyMinter() { require(msg.sender == minter, "not minter"); _; }

    constructor() {
        owner = msg.sender;
    }

    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "zero addr");
        minter = _minter;
        emit MinterSet(_minter);
    }

    function mint(address to, uint256 amount) external onlyMinter {
        require(to != address(0), "zero addr");
        totalSupply     += amount;
        balanceOf[to]   += amount;
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        return _transfer(msg.sender, to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            require(allowed >= amount, "insufficient allowance");
            allowance[from][msg.sender] = allowed - amount;
        }
        return _transfer(from, to, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal returns (bool) {
        require(to != address(0), "zero addr");
        require(balanceOf[from] >= amount, "insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to]   += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
