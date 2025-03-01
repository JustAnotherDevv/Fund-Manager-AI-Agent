// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MockERC20.sol";

contract MockUSDC is MockERC20 {
    constructor(address initialOwner) MockERC20("USD Coin", "USDC", 6, initialOwner) {}
}

contract MockUSDT is MockERC20 {
    constructor(address initialOwner) MockERC20("Tether USD", "USDT", 6, initialOwner) {}
}

contract MockDAI is MockERC20 {
    constructor(address initialOwner) MockERC20("Dai Stablecoin", "DAI", 18, initialOwner) {}
}

contract MockWETH is MockERC20 {
    constructor(address initialOwner) MockERC20("Wrapped Ether", "WETH", 18, initialOwner) {}
}

contract MockWBTC is MockERC20 {
    constructor(address initialOwner) MockERC20("Wrapped Bitcoin", "WBTC", 8, initialOwner) {}
}